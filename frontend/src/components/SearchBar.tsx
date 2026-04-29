import { useState, useRef, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/datepicker.css';
import type { SearchFilters } from '../types';

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

// Real location data from mock listings
const LOCATIONS = [
  { city: 'Malibu', state: 'California', country: 'United States' },
  { city: 'Brooklyn', state: 'New York', country: 'United States' },
  { city: 'Austin', state: 'Texas', country: 'United States' },
  { city: 'Aspen', state: 'Colorado', country: 'United States' },
  { city: 'Miami Beach', state: 'Florida', country: 'United States' },
  { city: 'San Francisco', state: 'California', country: 'United States' },
  { city: 'Honolulu', state: 'Hawaii', country: 'United States' },
  { city: 'Scottsdale', state: 'Arizona', country: 'United States' },
  { city: 'Las Vegas', state: 'Nevada', country: 'United States' },
  { city: 'New Orleans', state: 'Louisiana', country: 'United States' },
  { city: 'Denver', state: 'Colorado', country: 'United States' },
  { city: 'Los Angeles', state: 'California', country: 'United States' },
  { city: 'Seoul', state: 'South Korea', country: 'South Korea' },
  { city: 'Ghaziabad', state: 'Uttar Pradesh', country: 'India' },
  { city: 'Delhi', state: 'Delhi', country: 'India' },
  { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
];

const SearchBar = ({ onSearch, initialFilters }: SearchBarProps) => {
  const [location, setLocation] = useState(initialFilters?.city || '');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState(LOCATIONS);
  const [checkIn, setCheckIn] = useState<Date | null>(initialFilters?.checkIn || null);
  const [checkOut, setCheckOut] = useState<Date | null>(initialFilters?.checkOut || null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [pets, setPets] = useState(0);
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);

  const locationRef = useRef<HTMLDivElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const guestRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        locationRef.current &&
        !locationRef.current.contains(event.target as Node)
      ) {
        setShowLocationDropdown(false);
        if (activeField === 'location') setActiveField(null);
      }
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
        if (activeField === 'dates') setActiveField(null);
      }
      if (guestRef.current && !guestRef.current.contains(event.target as Node)) {
        setShowGuestPicker(false);
        if (activeField === 'guests') setActiveField(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeField]);

  // Filter locations based on input
  const handleLocationChange = (value: string) => {
    setLocation(value);
    if (value.trim()) {
      const filtered = LOCATIONS.filter(
        (loc) =>
          loc.city.toLowerCase().includes(value.toLowerCase()) ||
          loc.state.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations(LOCATIONS);
    }
  };

  const selectLocation = (loc: typeof LOCATIONS[0]) => {
    setLocation(`${loc.city}, ${loc.state}`);
    setShowLocationDropdown(false);
    setActiveField(null);
  };

  const totalGuests = adults + children;
  const guestText = () => {
    if (totalGuests === 0) return 'Add guests';
    const parts = [];
    if (totalGuests > 0) parts.push(`${totalGuests} guest${totalGuests > 1 ? 's' : ''}`);
    if (infants > 0) parts.push(`${infants} infant${infants > 1 ? 's' : ''}`);
    if (pets > 0) parts.push(`${pets} pet${pets > 1 ? 's' : ''}`);
    return parts.join(', ');
  };

  const handleSearch = () => {
    const filters: SearchFilters = {};
    if (location) {
      const cityMatch = location.split(',')[0].trim();
      filters.city = cityMatch;
    }
    if (totalGuests > 0) filters.guests = totalGuests;
    if (checkIn) filters.checkIn = checkIn;
    if (checkOut) filters.checkOut = checkOut;

    onSearch(filters);
    setShowLocationDropdown(false);
    setShowDatePicker(false);
    setShowGuestPicker(false);
    setActiveField(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
        <div className="flex items-stretch divide-x divide-gray-300">
          {/* Location */}
          <div
            ref={locationRef}
            className={`flex-1 relative ${activeField === 'location' ? 'bg-white rounded-full shadow-lg' : ''}`}
          >
            <div
              className="px-6 py-3 cursor-pointer hover:bg-gray-100 rounded-full transition"
              onClick={() => {
                setActiveField('location');
                setShowLocationDropdown(true);
                setShowDatePicker(false);
                setShowGuestPicker(false);
                locationInputRef.current?.focus();
              }}
            >
              <label htmlFor="search-location" className="block text-xs font-semibold text-gray-900 mb-1">
                Where
              </label>
              <input
                ref={locationInputRef}
                id="search-location"
                type="text"
                placeholder="Search destinations"
                value={location}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="w-full outline-none text-sm text-gray-600 placeholder-gray-400 bg-transparent"
                onFocus={() => {
                  setActiveField('location');
                  setShowLocationDropdown(true);
                }}
              />
            </div>

            {/* Location Dropdown */}
            {showLocationDropdown && activeField === 'location' && (
              <div className="absolute top-full mt-2 left-0 bg-white rounded-3xl shadow-2xl border border-gray-200 py-4 z-50 w-96">
                <div className="px-6 pb-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase">
                    Popular destinations
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {filteredLocations.length > 0 ? (
                    filteredLocations.map((loc, index) => (
                      <button
                        key={index}
                        onClick={() => selectLocation(loc)}
                        className="w-full px-6 py-3 hover:bg-gray-100 transition text-left flex items-center space-x-4"
                      >
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">📍</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {loc.city}
                          </p>
                          <p className="text-xs text-gray-500">
                            {loc.state}, {loc.country}
                          </p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-6 py-8 text-center text-gray-500">
                      No destinations found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Check-in & Check-out */}
          <div
            ref={dateRef}
            className={`flex-1 relative ${activeField === 'dates' ? 'bg-white rounded-full shadow-lg' : ''}`}
          >
            <div className="flex divide-x divide-gray-300">
              <div
                className="flex-1 px-6 py-3 cursor-pointer hover:bg-gray-100 transition"
                onClick={() => {
                  setActiveField('dates');
                  setShowDatePicker(true);
                  setShowLocationDropdown(false);
                  setShowGuestPicker(false);
                }}
              >
                <label className="block text-xs font-semibold text-gray-900 mb-1">
                  Check in
                </label>
                <div className="text-sm text-gray-600">
                  {checkIn ? checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Add dates'}
                </div>
              </div>
              <div
                className="flex-1 px-6 py-3 cursor-pointer hover:bg-gray-100 transition rounded-r-full"
                onClick={() => {
                  setActiveField('dates');
                  setShowDatePicker(true);
                  setShowLocationDropdown(false);
                  setShowGuestPicker(false);
                }}
              >
                <label className="block text-xs font-semibold text-gray-900 mb-1">
                  Check out
                </label>
                <div className="text-sm text-gray-600">
                  {checkOut ? checkOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Add dates'}
                </div>
              </div>
            </div>

            {/* Date Picker Dropdown */}
            {showDatePicker && activeField === 'dates' && (
              <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-white rounded-3xl z-50" style={{ boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)' }}>
                <div className="pt-6">
                  <DatePicker
                    selected={checkIn}
                    onChange={(dates) => {
                      const [start, end] = dates as [Date | null, Date | null];
                      setCheckIn(start);
                      setCheckOut(end);
                    }}
                    startDate={checkIn}
                    endDate={checkOut}
                    selectsRange
                    minDate={new Date()}
                    monthsShown={2}
                    inline
                    dateFormat="MMM d"
                    showPopperArrow={false}
                  />
                </div>
                <div className="px-8 py-5 flex justify-between items-center border-t border-gray-200" style={{ marginTop: '8px' }}>
                  <button
                    onClick={() => {
                      setCheckIn(null);
                      setCheckOut(null);
                    }}
                    className="text-sm font-semibold text-gray-900 underline hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
                  >
                    Clear dates
                  </button>
                  <button
                    onClick={() => {
                      setShowDatePicker(false);
                      setActiveField(null);
                    }}
                    className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-black transition-colors shadow-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Guests */}
          <div
            ref={guestRef}
            className={`flex-1 relative ${activeField === 'guests' ? 'bg-white rounded-full shadow-lg' : ''}`}
          >
            <div
              className="px-6 py-3 cursor-pointer hover:bg-gray-100 rounded-r-full transition flex items-center justify-between"
              onClick={() => {
                setActiveField('guests');
                setShowGuestPicker(true);
                setShowLocationDropdown(false);
                setShowDatePicker(false);
              }}
            >
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-900 mb-1">
                  Who
                </label>
                <div className="text-sm text-gray-600">{guestText()}</div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSearch();
                }}
                className="bg-airbnb-red text-white rounded-full p-3 hover:bg-red-600 transition ml-2"
              >
                <FaSearch className="text-lg" />
              </button>
            </div>

            {/* Guest Picker Dropdown */}
            {showGuestPicker && activeField === 'guests' && (
              <div className="absolute top-full mt-2 right-0 bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 z-50 w-96">
                {/* Adults */}
                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Adults</p>
                    <p className="text-xs text-gray-500">Ages 13 or above</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setAdults(Math.max(0, adults - 1))}
                      disabled={adults === 0}
                      className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      <span className="text-gray-600">−</span>
                    </button>
                    <span className="text-sm font-medium w-8 text-center">
                      {adults}
                    </span>
                    <button
                      onClick={() => setAdults(adults + 1)}
                      className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center hover:border-gray-900 transition"
                    >
                      <span className="text-gray-600">+</span>
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Children</p>
                    <p className="text-xs text-gray-500">Ages 2–12</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      disabled={children === 0}
                      className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      <span className="text-gray-600">−</span>
                    </button>
                    <span className="text-sm font-medium w-8 text-center">
                      {children}
                    </span>
                    <button
                      onClick={() => setChildren(children + 1)}
                      className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center hover:border-gray-900 transition"
                    >
                      <span className="text-gray-600">+</span>
                    </button>
                  </div>
                </div>

                {/* Infants */}
                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Infants</p>
                    <p className="text-xs text-gray-500">Under 2</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setInfants(Math.max(0, infants - 1))}
                      disabled={infants === 0}
                      className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      <span className="text-gray-600">−</span>
                    </button>
                    <span className="text-sm font-medium w-8 text-center">
                      {infants}
                    </span>
                    <button
                      onClick={() => setInfants(infants + 1)}
                      className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center hover:border-gray-900 transition"
                    >
                      <span className="text-gray-600">+</span>
                    </button>
                  </div>
                </div>

                {/* Pets */}
                <div className="flex items-center justify-between py-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Pets</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setPets(Math.max(0, pets - 1))}
                      disabled={pets === 0}
                      className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      <span className="text-gray-600">−</span>
                    </button>
                    <span className="text-sm font-medium w-8 text-center">
                      {pets}
                    </span>
                    <button
                      onClick={() => setPets(pets + 1)}
                      className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center hover:border-gray-900 transition"
                    >
                      <span className="text-gray-600">+</span>
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowGuestPicker(false);
                      setActiveField(null);
                    }}
                    className="w-full bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-gray-800 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
