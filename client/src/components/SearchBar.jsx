import { Search, MapPin, Monitor, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    condition: "",
    location: "",
    appointmentType: "in-person",
  });

  const handleInputChange = (field, value) => {
    setSearchData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    // Navigate to doctor listing with search params
    const params = new URLSearchParams();
    if (searchData.condition) params.append("specialty", searchData.condition);
    if (searchData.location) params.append("location", searchData.location);
    if (searchData.appointmentType)
      params.append("appointmentType", searchData.appointmentType);

    navigate(`/doctors?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft p-8 max-w-5xl mx-auto border border-gray-100">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchData.condition}
              onChange={(e) => handleInputChange("condition", e.target.value)}
              placeholder="Condition, procedure, doctor name"
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 placeholder-gray-500 transition-all hover:border-gray-300"
            />
          </div>
        </div>

        {/* Location Input */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="City or region"
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 placeholder-gray-500 transition-all hover:border-gray-300"
            />
          </div>
        </div>

        {/* Appointment Type */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Appointment Type
          </label>
          <div className="relative">
            <Monitor className="absolute left-4 top-4 h-5 w-5 text-gray-400 z-10" />
            <select
              value={searchData.appointmentType}
              onChange={(e) =>
                handleInputChange("appointmentType", e.target.value)
              }
              className="w-full pl-12 pr-10 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent appearance-none text-gray-900 transition-all hover:border-gray-300 cursor-pointer"
            >
              <option value="in-person">In-person</option>
              <option value="telemedicine">Telemedicine</option>
              <option value="both">Both</option>
            </select>
            <ChevronDown className="absolute right-4 top-4 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Search Button */}
        <div className="lg:col-span-1 flex items-end">
          <button
            onClick={handleSearch}
            className="w-full bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-hover transition-all duration-200 shadow-md hover:shadow-lg text-lg"
          >
            Find Doctor
          </button>
        </div>
      </div>

      {/* Popular Searches */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <p className="text-sm text-gray-600 mb-3">Popular searches:</p>
        <div className="flex flex-wrap gap-2">
          {[
            "Primary Care",
            "Cardiologist",
            "Dermatologist",
            "Psychiatrist",
            "Pediatrician",
          ].map((term) => (
            <button
              key={term}
              onClick={() => handleInputChange("condition", term)}
              className="px-4 py-2 bg-gray-50 text-gray-700 rounded-full text-sm hover:bg-gray-100 transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
