import mongoose, { Schema, Document } from 'mongoose';

export interface IListingDocument extends Document {
  hostId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  propertyType: string;
  roomType: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    latitude: number;
    longitude: number;
  };
  price: number;
  images: string[];
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  rules: string[];
  checkInTime: string;
  checkOutTime: string;
  minNights: number;
  maxNights: number;
  instantBook: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const listingSchema = new Schema<IListingDocument>(
  {
    hostId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: 2000,
    },
    propertyType: {
      type: String,
      required: true,
      enum: ['apartment', 'house', 'villa', 'cabin', 'cottage', 'loft', 'other'],
    },
    roomType: {
      type: String,
      required: true,
      enum: ['entire_place', 'private_room', 'shared_room'],
    },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      zipCode: { type: String, required: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    images: {
      type: [String],
      required: true,
      validate: {
        validator: function (v: string[]) {
          return v.length > 0;
        },
        message: 'At least one image is required',
      },
    },
    maxGuests: {
      type: Number,
      required: true,
      min: 1,
      max: 16,
    },
    bedrooms: {
      type: Number,
      required: true,
      min: 0,
    },
    beds: {
      type: Number,
      required: true,
      min: 1,
    },
    bathrooms: {
      type: Number,
      required: true,
      min: 0.5,
    },
    amenities: {
      type: [String],
      default: [],
    },
    rules: {
      type: [String],
      default: [],
    },
    checkInTime: {
      type: String,
      default: '3:00 PM',
    },
    checkOutTime: {
      type: String,
      default: '11:00 AM',
    },
    minNights: {
      type: Number,
      default: 1,
      min: 1,
    },
    maxNights: {
      type: Number,
      default: 365,
    },
    instantBook: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for geospatial queries
listingSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
listingSchema.index({ price: 1 });
listingSchema.index({ propertyType: 1 });
listingSchema.index({ city: 1 });

export default mongoose.model<IListingDocument>('Listing', listingSchema);
