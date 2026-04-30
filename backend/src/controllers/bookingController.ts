import { Response } from 'express';
import Booking from '../models/Booking';
import Listing from '../models/Listing';
import { AuthRequest } from '../types';
import { differenceInDays } from 'date-fns';

export const createBooking = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { listingId, checkIn, checkOut, guests } = req.body;

    // Check if listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    // Check absolute guest limit
    if (guests > 16) {
      res.status(400).json({ error: 'Maximum 16 guests allowed' });
      return;
    }

    // Check guest capacity
    if (guests > listing.maxGuests) {
      res.status(400).json({
        error: `Maximum ${listing.maxGuests} guests allowed`,
      });
      return;
    }

    // Calculate nights and validate
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = differenceInDays(checkOutDate, checkInDate);

    if (nights < listing.minNights) {
      res.status(400).json({
        error: `Minimum stay is ${listing.minNights} nights`,
      });
      return;
    }

    if (nights > listing.maxNights) {
      res.status(400).json({
        error: `Maximum stay is ${listing.maxNights} nights`,
      });
      return;
    }

    // Check availability
    const conflictingBookings = await Booking.find({
      listingId,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        { checkIn: { $gte: checkInDate, $lt: checkOutDate } },
        { checkOut: { $gt: checkInDate, $lte: checkOutDate } },
        {
          $and: [{ checkIn: { $lte: checkInDate } }, { checkOut: { $gte: checkOutDate } }],
        },
      ],
    });

    if (conflictingBookings.length > 0) {
      res.status(400).json({ error: 'Listing not available for selected dates' });
      return;
    }

    // Calculate total price
    const totalPrice = listing.price * nights;

    const booking = await Booking.create({
      listingId,
      guestId: req.user?.userId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      totalPrice,
      status: 'confirmed',
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('listingId', 'title images location price')
      .populate('guestId', 'firstName lastName email');

    res.status(201).json({
      message: 'Booking created successfully',
      booking: populatedBooking,
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

export const getUserBookings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const bookings = await Booking.find({ guestId: req.user?.userId })
      .populate('listingId', 'title images location price')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

export const getHostBookings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Find all listings by this host
    const listings = await Listing.find({ hostId: req.user?.userId });
    const listingIds = listings.map((listing) => listing._id);

    // Find all bookings for these listings
    const bookings = await Booking.find({ listingId: { $in: listingIds } })
      .populate('listingId', 'title images location price')
      .populate('guestId', 'firstName lastName email avatar')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    console.error('Get host bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

export const getBookingById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('listingId', 'title images location price hostId')
      .populate('guestId', 'firstName lastName email avatar');

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    // Check authorization
    const listing = booking.listingId as any;
    if (
      booking.guestId._id.toString() !== req.user?.userId &&
      listing.hostId.toString() !== req.user?.userId
    ) {
      res.status(403).json({ error: 'Not authorized to view this booking' });
      return;
    }

    res.json({ booking });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
};

export const cancelBooking = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    // Check authorization
    if (booking.guestId.toString() !== req.user?.userId) {
      res.status(403).json({ error: 'Not authorized to cancel this booking' });
      return;
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      res.status(400).json({ error: 'Booking already cancelled' });
      return;
    }

    if (booking.status === 'completed') {
      res.status(400).json({ error: 'Cannot cancel completed booking' });
      return;
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      message: 'Booking cancelled successfully',
      booking,
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
};
