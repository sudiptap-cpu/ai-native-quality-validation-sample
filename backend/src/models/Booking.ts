import mongoose, { Schema, Document } from 'mongoose';

export interface IBookingDocument extends Document {
  listingId: mongoose.Types.ObjectId;
  guestId: mongoose.Types.ObjectId;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBookingDocument>(
  {
    listingId: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    guestId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    checkIn: {
      type: Date,
      required: [true, 'Check-in date is required'],
    },
    checkOut: {
      type: Date,
      required: [true, 'Check-out date is required'],
      validate: {
        validator: function (this: IBookingDocument, value: Date) {
          return value > this.checkIn;
        },
        message: 'Check-out date must be after check-in date',
      },
    },
    guests: {
      type: Number,
      required: [true, 'Number of guests is required'],
      min: 1,
      max: 16,
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'confirmed',
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying bookings by listing and date range
bookingSchema.index({ listingId: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ guestId: 1 });

export default mongoose.model<IBookingDocument>('Booking', bookingSchema);
