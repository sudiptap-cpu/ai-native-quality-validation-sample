import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import DatePicker from 'react-datepicker';
import toast from 'react-hot-toast';
import {
  FaStar,
  FaMapMarkerAlt,
  FaUsers,
  FaBed,
  FaBath,
  FaWifi,
  FaParking,
  FaTv,
  FaSnowflake,
} from 'react-icons/fa';
import { listingService } from '../services/listingService';
import { bookingService } from '../services/bookingService';
import { useAuthStore } from '../store/authStore';
import { differenceInDays } from 'date-fns';

const amenityIcons: Record<string, any> = {
  WiFi: FaWifi,
  'Free parking': FaParking,
  TV: FaTv,
  'Air conditioning': FaSnowflake,
};

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [, setSelectedImage] = useState(0);
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingService.getListingById(id!),
    enabled: !!id,
  });

  const bookingMutation = useMutation({
    mutationFn: bookingService.createBooking,
    onSuccess: () => {
      toast.success('Booking confirmed!');
      navigate('/bookings');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Booking failed');
    },
  });

  const handleBooking = () => {
    if (!isAuthenticated) {
      toast.error('Please login to book');
      navigate('/login');
      return;
    }

    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    bookingMutation.mutate({
      listingId: id!,
      checkIn,
      checkOut,
      guests,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-airbnb-red"></div>
      </div>
    );
  }

  if (!data?.listing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Listing not found</p>
      </div>
    );
  }

  const { listing, reviews } = data;
  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const totalPrice = nights * listing.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          {listing.title}
        </h1>
        <div className="flex items-center space-x-4 text-sm">
          {listing.rating && (
            <div className="flex items-center">
              <FaStar className="text-black mr-1" />
              <span className="font-semibold">{listing.rating}</span>
              <span className="text-gray-600 ml-1">
                ({listing.reviewCount} reviews)
              </span>
            </div>
          )}
          <div className="flex items-center text-gray-600">
            <FaMapMarkerAlt className="mr-1" />
            {listing.location.city}, {listing.location.state},{' '}
            {listing.location.country}
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-4 gap-2 rounded-xl overflow-hidden mb-8 h-[500px]">
        <div
          className="col-span-2 row-span-2 cursor-pointer"
          onClick={() => setSelectedImage(0)}
        >
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover hover:brightness-95 transition"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/800x600?text=No+Image';
            }}
          />
        </div>
        {listing.images.slice(1, 5).map((image, index) => (
          <div
            key={index}
            className="cursor-pointer"
            onClick={() => setSelectedImage(index + 1)}
          >
            <img
              src={image}
              alt={`${listing.title} ${index + 2}`}
              className="w-full h-full object-cover hover:brightness-95 transition"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
              }}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Host Info */}
          <div className="pb-8 border-b border-gray-200">
            <h2 className="text-2xl font-semibold mb-4">
              {listing.propertyType} hosted by{' '}
              {typeof listing.hostId === 'object' ? listing.hostId.firstName : 'Host'}
            </h2>
            <div className="flex items-center space-x-4 text-gray-600">
              <span><FaUsers className="inline mr-1" />{listing.maxGuests} guests</span>
              <span>·</span>
              <span><FaBed className="inline mr-1" />{listing.bedrooms} bedrooms</span>
              <span>·</span>
              <span><FaBath className="inline mr-1" />{listing.bathrooms} baths</span>
            </div>
          </div>

          {/* Description */}
          <div className="pb-8 border-b border-gray-200">
            <h3 className="text-xl font-semibold mb-4">About this place</h3>
            <p className="text-gray-600 whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Amenities */}
          <div className="pb-8 border-b border-gray-200">
            <h3 className="text-xl font-semibold mb-4">What this place offers</h3>
            <div className="grid grid-cols-2 gap-4">
              {listing.amenities.map((amenity, index) => {
                const Icon = amenityIcons[amenity] || FaWifi;
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <Icon className="text-gray-600" />
                    <span>{amenity}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews */}
          {reviews && reviews.length > 0 && (
            <div className="pb-8 border-b border-gray-200">
              <h3 className="text-xl font-semibold mb-6">
                <FaStar className="inline text-black mr-1" />
                {listing.rating} · {reviews.length} reviews
              </h3>
              <div className="space-y-6">
                {reviews.slice(0, 6).map((review) => (
                  <div key={review._id}>
                    <div className="flex items-center space-x-3 mb-2">
                      {review.userId.avatar ? (
                        <img
                          src={review.userId.avatar}
                          alt={review.userId.firstName}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-300" />
                      )}
                      <div>
                        <p className="font-semibold">
                          {review.userId.firstName} {review.userId.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 border border-gray-300 rounded-xl p-6 shadow-xl">
            <div className="flex items-baseline mb-6">
              <span className="text-2xl font-semibold">${listing.price}</span>
              <span className="text-gray-600 ml-1">night</span>
            </div>

            <div className="space-y-4 mb-4">
              <div className="grid grid-cols-2 border border-gray-300 rounded-lg overflow-hidden">
                <div className="p-3 border-r border-gray-300">
                  <label className="block text-xs font-semibold mb-1">
                    CHECK-IN
                  </label>
                  <DatePicker
                    selected={checkIn}
                    onChange={(date) => setCheckIn(date)}
                    selectsStart
                    startDate={checkIn}
                    endDate={checkOut}
                    minDate={new Date()}
                    placeholderText="Add date"
                    className="w-full text-sm outline-none"
                  />
                </div>
                <div className="p-3">
                  <label className="block text-xs font-semibold mb-1">
                    CHECKOUT
                  </label>
                  <DatePicker
                    selected={checkOut}
                    onChange={(date) => setCheckOut(date)}
                    selectsEnd
                    startDate={checkIn}
                    endDate={checkOut}
                    minDate={checkIn || new Date()}
                    placeholderText="Add date"
                    className="w-full text-sm outline-none"
                  />
                </div>
              </div>

              <div className="border border-gray-300 rounded-lg p-3">
                <label className="block text-xs font-semibold mb-1">
                  GUESTS
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  className="w-full text-sm outline-none"
                >
                  {Array.from({ length: Math.min(listing.maxGuests, 16) }, (_, i) => i + 1).map(
                    (num) => (
                      <option key={num} value={num}>
                        {num} guest{num > 1 ? 's' : ''}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            <button
              onClick={handleBooking}
              disabled={bookingMutation.isPending || !checkIn || !checkOut}
              className="w-full bg-airbnb-red text-white font-semibold py-3 rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bookingMutation.isPending ? 'Booking...' : 'Reserve'}
            </button>

            {nights > 0 && (
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>
                    ${listing.price} x {nights} nights
                  </span>
                  <span>${listing.price * nights}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Service fee</span>
                  <span>${Math.round(totalPrice * 0.14)}</span>
                </div>
                <div className="border-t border-gray-300 pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${totalPrice + Math.round(totalPrice * 0.14)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
