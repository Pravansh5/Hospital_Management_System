import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, Loader2 } from "lucide-react";
import DoctorCard from "../components/DoctorCard";
import api from "../utils/api";

const DoctorListing = () => {
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    specialty: searchParams.get("specialty") || "",
    location: searchParams.get("location") || "",
    appointmentType: searchParams.get("appointmentType") || "",
    minExperience: "",
    maxFee: "",
  });

  // Fetch doctors from API
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await api.get(`/provider?${queryParams}`);
      const data = response.data;

      if (data.success) {
        // Transform API data to match component expectations
        const transformedDoctors = data.data.providers.map((provider) => ({
          id: provider.doctorId._id,
          name: provider.doctorId.name,
          specialty: provider.specialty,
          rating: provider.rating || 0,
          reviewCount: provider.reviewCount || 0,
          location: provider.location || "Location not specified",
          nextAvailable: "Check availability", // This would need to be calculated
          image: "/api/placeholder/120/120",
          acceptsInsurance: true, // This would need to be added to the model
          telemedicine:
            provider.appointmentType === "telemedicine" ||
            provider.appointmentType === "both",
          experience: `${provider.experience}+ years`,
          education: "Education not specified", // This would need to be added to the model
          price: provider.consultationFee
            ? `$${provider.consultationFee}`
            : "Price not set",
        }));

        setDoctors(transformedDoctors);
      } else {
        setError(data.message || "Failed to fetch doctors");
      }
    } catch (err) {
      console.error("Error fetching doctors:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to connect to server. Please check if the backend is running.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading doctors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-red-500 mb-4">
            <h2 className="text-xl font-semibold">Error Loading Doctors</h2>
            <p>{error}</p>
          </div>
          <button onClick={fetchDoctors} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Available Doctors
          </h1>
          <p className="text-gray-600">
            {doctors.length} doctor{doctors.length !== 1 ? "s" : ""} found
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <SlidersHorizontal className="h-5 w-5" />
                </button>
              </div>

              <div
                className={`space-y-6 ${
                  showFilters ? "block" : "hidden lg:block"
                }`}
              >
                {/* Specialty Filter */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Specialty</h4>
                  <select
                    value={filters.specialty}
                    onChange={(e) =>
                      handleFilterChange("specialty", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  >
                    <option value="">All Specialties</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Psychiatrist">Psychiatrist</option>
                    <option value="Primary Care">Primary Care</option>
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Location</h4>
                  <input
                    type="text"
                    placeholder="Enter location"
                    value={filters.location}
                    onChange={(e) =>
                      handleFilterChange("location", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  />
                </div>

                {/* Appointment Type Filter */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Appointment Type
                  </h4>
                  <select
                    value={filters.appointmentType}
                    onChange={(e) =>
                      handleFilterChange("appointmentType", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  >
                    <option value="">All Types</option>
                    <option value="in-person">In-person</option>
                    <option value="telemedicine">Telemedicine</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                {/* Experience Filter */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Minimum Experience (years)
                  </h4>
                  <input
                    type="number"
                    placeholder="Min years"
                    value={filters.minExperience}
                    onChange={(e) =>
                      handleFilterChange("minExperience", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    min="0"
                  />
                </div>

                {/* Fee Filter */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Maximum Fee ($)
                  </h4>
                  <input
                    type="number"
                    placeholder="Max fee"
                    value={filters.maxFee}
                    onChange={(e) =>
                      handleFilterChange("maxFee", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    min="0"
                  />
                </div>

                {/* Clear Filters Button */}
                <button
                  onClick={() =>
                    setFilters({
                      specialty: "",
                      location: "",
                      appointmentType: "",
                      minExperience: "",
                      maxFee: "",
                    })
                  }
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Doctor List */}
          <div className="lg:w-3/4">
            {doctors.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <svg
                    className="mx-auto h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No doctors found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search criteria.
                </p>
                <button
                  onClick={() =>
                    setFilters({
                      specialty: "",
                      location: "",
                      appointmentType: "",
                      minExperience: "",
                      maxFee: "",
                    })
                  }
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {doctors.map((doctor, index) => (
                  <DoctorCard key={doctor.id} doctor={doctor} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorListing;
