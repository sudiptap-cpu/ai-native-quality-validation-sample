import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FaHome, FaMapMarkerAlt, FaDollarSign, FaCamera, FaCheck } from 'react-icons/fa';
import { listingService } from '../services/listingService';
import { useAuthStore } from '../store/authStore';

interface ListingFormData {
  title: string;
  description: string;
  propertyType: string;
  price: number;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
}

const PROPERTY_TYPES = ['Villa', 'Apartment', 'Cabin', 'House', 'Loft', 'Condo', 'Penthouse'];

const AVAILABLE_AMENITIES = [
  'WiFi',
  'Kitchen',
  'Washer',
  'Dryer',
  'Air conditioning',
  'Heating',
  'TV',
  'Pool',
  'Hot tub',
  'Free parking',
  'Gym',
  'Breakfast',
  'Pet friendly',
  'Smoking allowed',
  'Wheelchair accessible',
  'Elevator',
  'Fireplace',
  'Workspace',
];

const BecomeHost = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    description: '',
    propertyType: '',
    price: 0,
    location: {
      address: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
    },
    maxGuests: 1,
    bedrooms: 1,
    bathrooms: 1,
    amenities: [],
    images: [],
  });

  const [imageUrl, setImageUrl] = useState('');

  const createListingMutation = useMutation({
    mutationFn: listingService.createListing,
    onSuccess: () => {
      toast.success('Listing created successfully!');
      navigate('/');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create listing');
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [locationField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: name === 'price' || name === 'maxGuests' || name === 'bedrooms' || name === 'bathrooms'
          ? Number(value)
          : value,
      });
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.includes(amenity)
        ? formData.amenities.filter((a) => a !== amenity)
        : [...formData.amenities, amenity],
    });
  };

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, imageUrl.trim()],
      });
      setImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please log in to create a listing');
      navigate('/login');
      return;
    }

    if (formData.images.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    if (formData.amenities.length === 0) {
      toast.error('Please select at least one amenity');
      return;
    }

    createListingMutation.mutate(formData);
  };

  const nextStep = () => {
    if (currentStep === 1 && !formData.propertyType) {
      toast.error('Please select a property type');
      return;
    }
    if (currentStep === 2 && (!formData.location.city || !formData.location.country)) {
      toast.error('Please fill in location details');
      return;
    }
    if (currentStep === 3 && (!formData.title || !formData.description)) {
      toast.error('Please provide title and description');
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => setCurrentStep(currentStep - 1);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Sign in to become a host
          </h2>
          <p className="text-gray-600 mb-8">
            You need to be logged in to create a listing
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-airbnb-red text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-600"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Become a Host
          </h1>
          <p className="text-lg text-gray-600">
            Share your space and earn extra income
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-start justify-between">
            {[1, 2, 3, 4, 5].map((step, index) => {
              const labels = ['Property', 'Location', 'Details', 'Amenities', 'Photos'];
              return (
                <div key={step} className="flex items-center" style={{ flex: step === 5 ? '0 0 auto' : '1' }}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step <= currentStep
                          ? 'bg-airbnb-red text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {step < currentStep ? <FaCheck /> : step}
                    </div>
                    <span className="mt-2 text-xs text-gray-600 text-center whitespace-nowrap">
                      {labels[index]}
                    </span>
                  </div>
                  {step < 5 && (
                    <div
                      className={`h-1 mx-2 -mt-3 ${
                        step < currentStep ? 'bg-airbnb-red' : 'bg-gray-300'
                      }`}
                      style={{ flex: '1', minWidth: '40px' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Property Type */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                    <FaHome className="mr-2 text-airbnb-red" />
                    What type of property are you listing?
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Choose the category that best describes your place
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {PROPERTY_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, propertyType: type })
                      }
                      className={`p-6 rounded-lg border-2 transition ${
                        formData.propertyType === type
                          ? 'border-airbnb-red bg-red-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-3xl mb-2">🏠</div>
                      <div className="font-semibold">{type}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-airbnb-red" />
                    Where is your property located?
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Guests will only get your exact address after booking
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="location.address"
                      value={formData.location.address}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-red"
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="location.city"
                        value={formData.location.city}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-red"
                        placeholder="San Francisco"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State/Province
                      </label>
                      <input
                        type="text"
                        name="location.state"
                        value={formData.location.state}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-red"
                        placeholder="California"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        name="location.country"
                        value={formData.location.country}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-red"
                        placeholder="United States"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Zip Code
                      </label>
                      <input
                        type="text"
                        name="location.zipCode"
                        value={formData.location.zipCode}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-red"
                        placeholder="94102"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Tell us about your place
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Share some details to help guests find your listing
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-red"
                    placeholder="Beautiful beachfront villa with ocean views"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-red"
                    placeholder="Describe what makes your place special..."
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guests
                    </label>
                    <input
                      type="number"
                      name="maxGuests"
                      value={formData.maxGuests}
                      onChange={handleChange}
                      min="1"
                      max="16"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-red"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleChange}
                      min="1"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-red"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleChange}
                      min="1"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-red"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FaDollarSign className="mr-1" />
                      Price/night
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min="1"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-red"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Amenities */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    What amenities do you offer?
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Select all amenities available to guests
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {AVAILABLE_AMENITIES.map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => handleAmenityToggle(amenity)}
                      className={`p-4 rounded-lg border-2 transition text-left ${
                        formData.amenities.includes(amenity)
                          ? 'border-airbnb-red bg-red-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{amenity}</span>
                        {formData.amenities.includes(amenity) && (
                          <FaCheck className="text-airbnb-red" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Photos */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                    <FaCamera className="mr-2 text-airbnb-red" />
                    Add photos of your property
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Upload at least one photo. Great photos help your listing stand out!
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Enter image URL"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-red"
                    />
                    <button
                      type="button"
                      onClick={handleAddImage}
                      className="px-6 py-3 bg-airbnb-red text-white rounded-lg hover:bg-red-600"
                    >
                      Add
                    </button>
                  </div>

                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img}
                            alt={`Property ${index + 1}`}
                            className="w-full h-40 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-airbnb-red text-white rounded-lg hover:bg-red-600"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={createListingMutation.isPending}
                  className="px-6 py-3 bg-airbnb-red text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createListingMutation.isPending
                    ? 'Creating...'
                    : 'Create Listing'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BecomeHost;
