import {
  Star,
  MapPin,
  Clock,
  Video,
  Shield,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const DoctorCard = ({ doctor }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status and user role
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Check if current user can book appointments (only patients can book)
  const canBookAppointment = isAuthenticated && currentUser?.role === "patient";
  const {
    id = 1,
    name = "Dr. John Smith",
    specialty = "Cardiologist",
    rating = 4.8,
    reviewCount = 127,
    location = "New York, NY",
    nextAvailable = "Today",
    image = "/api/placeholder/120/120",
    acceptsInsurance = true,
    telemedicine = true,
    experience = "10+ years",
    education = "Harvard Medical School",
    price = "$200",
  } = doctor || {};

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 hover:shadow-soft transition-all duration-300 group">
      <div className="flex items-start space-x-5">
        {/* Doctor Image */}
        <div className="relative">
          <img
            src={image}
            alt={name}
            className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-100"
          />
          {telemedicine && (
            <div className="absolute -top-2 -right-2 bg-blue-500 text-white p-1.5 rounded-full">
              <Video className="h-3 w-3" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Doctor Info */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <Link
                to={`/doctor/${id}`}
                className="text-xl font-bold text-gray-900 hover:text-primary transition-colors group-hover:text-primary"
              >
                {name}
              </Link>
              <p className="text-gray-600 font-medium mt-1">{specialty}</p>
              <p className="text-sm text-gray-500 mt-1">{education}</p>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-primary mb-1">
                {price}
              </div>
              <div className="text-sm text-gray-500">per visit</div>
            </div>
          </div>

          {/* Rating and Reviews */}
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {renderStars(rating)}
              <span className="ml-2 text-sm font-semibold text-gray-900">
                {rating}
              </span>
            </div>
            <span className="ml-2 text-sm text-gray-500">
              ({reviewCount} reviews)
            </span>
            <span className="ml-4 text-sm text-gray-500">• {experience}</span>
          </div>

          {/* Location and Availability */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
              <span className="truncate">{location}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2 text-gray-400" />
              <span>
                Next:{" "}
                <span className="font-medium text-green-600">
                  {nextAvailable}
                </span>
              </span>
            </div>
          </div>

          {/* Tags and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {acceptsInsurance && (
                <div className="flex items-center text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200">
                  <Shield className="h-3 w-3 mr-1" />
                  Insurance
                </div>
              )}
              {telemedicine && (
                <div className="flex items-center text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-200">
                  <Video className="h-3 w-3 mr-1" />
                  Video Visit
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to={`/doctor/${id}`}
                className="text-primary hover:text-primary-hover font-medium text-sm flex items-center transition-colors"
                onClick={() => console.log('Navigating to doctor profile:', id)}
              >
                View Profile
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
              {canBookAppointment && (
                <Link
                  to={`/book/${id}`}
                  className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-hover transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                  onClick={() => console.log('Navigating to booking form for doctor:', id)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Now
                </Link>
              )}
              {!isAuthenticated && (
                <button
                  onClick={() => {
                    alert("Please log in as a patient to book appointments");
                  }}
                  className="bg-gray-400 text-white px-6 py-2.5 rounded-xl font-semibold cursor-not-allowed flex items-center"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Now
                </button>
              )}
              {isAuthenticated && currentUser?.role === "doctor" && (
                <div className="text-sm text-gray-500 italic px-6 py-2.5">
                  Doctors cannot book appointments
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
