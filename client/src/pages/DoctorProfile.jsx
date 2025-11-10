import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Star,
  MapPin,
  Clock,
  Video,
  Phone,
  Mail,
  Calendar,
  Award,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

const DoctorProfile = () => {
  const navigate = useNavigate();
  const { id: doctorId } = useParams();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // Fetch doctor profile from API
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please login to view doctor profiles");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `http://localhost:4000/api/provider/${doctorId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch doctor profile: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          // Transform API data to match component expectations
          const profile = data.data;
          const transformedDoctor = {
            id: profile.doctorId._id,
            name: profile.doctorId.name,
            specialty: profile.specialty,
            rating: profile.rating || 0,
            reviewCount: profile.reviewCount || 0,
            location: profile.location || "Location not specified",
            image: "/api/placeholder/200/200",
            acceptsInsurance: true, // This would need to be added to the model
            telemedicine:
              profile.appointmentType === "telemedicine" ||
              profile.appointmentType === "both",
            experience: `${profile.experience}+ years`,
            education: "Education not specified", // This would need to be added to the model
            languages: profile.languages || ["English"],
            about: profile.bio || "No bio available",
            phone: profile.doctorId.phone || "Phone not provided",
            email: profile.doctorId.email,
            consultationFee: profile.consultationFee || 0,
            availability: profile.availability || [],
          };

          setDoctor(transformedDoctor);
        } else {
          setError(data.message || "Failed to fetch doctor profile");
        }
      } catch (err) {
        console.error("Error fetching doctor profile:", err);
        setError(err.message || "Failed to fetch doctor profile");
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchDoctorProfile();
    }
  }, [doctorId]);

  // Mock available slots - in a real app, this would come from the API
  const availableSlots = {
    "2024-01-15": ["9:00 AM", "10:30 AM", "2:00 PM", "3:30 PM"],
    "2024-01-16": ["9:00 AM", "11:00 AM", "1:00 PM", "4:00 PM"],
    "2024-01-17": ["10:00 AM", "11:30 AM", "2:30 PM", "4:30 PM"],
  };

  const reviews = [
    {
      id: 1,
      patient: "John D.",
      rating: 5,
      date: "2024-01-10",
      comment: "Excellent doctor! Very thorough and caring. Highly recommend.",
    },
    {
      id: 2,
      patient: "Maria S.",
      rating: 5,
      date: "2024-01-08",
      comment:
        "Dr. Johnson took the time to explain everything clearly. Great experience.",
    },
  ];

  const handleBookAppointment = () => {
    if (!isAuthenticated) {
      alert("Please log in as a patient to book appointments");
      return;
    }
    
    if (currentUser?.role !== "patient") {
      alert("Only patients can book appointments");
      return;
    }
    
    if (selectedDate && selectedTime) {
      navigate(`/book/${doctor.id}?date=${selectedDate}&time=${selectedTime}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading doctor profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-red-500 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-xl font-semibold">
              Error Loading Doctor Profile
            </h2>
            <p>{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Doctor Not Found</h2>
            <p>The doctor profile you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Doctor Info */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-8"
            >
              <div className="flex items-start space-x-6">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-32 h-32 rounded-full object-cover"
                />

                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {doctor.name}
                  </h1>
                  <p className="text-xl text-gray-600 mb-4">
                    {doctor.specialty}
                  </p>

                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="ml-1 text-lg font-medium text-gray-900">
                        {doctor.rating}
                      </span>
                    </div>
                    <span className="ml-2 text-gray-500">
                      ({doctor.reviewCount} reviews)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {doctor.location}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Award className="h-4 w-4 mr-2" />
                      {doctor.experience}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {doctor.phone}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {doctor.email}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {doctor.acceptsInsurance && (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        Accepts Insurance
                      </span>
                    )}
                    {doctor.telemedicine && (
                      <div className="flex items-center text-blue-600">
                        <Video className="h-4 w-4 mr-1" />
                        <span className="text-sm">Telemedicine Available</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* About Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mt-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                {doctor.about}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Education
                  </h3>
                  <p className="text-gray-600">{doctor.education}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Languages
                  </h3>
                  <p className="text-gray-600">{doctor.languages.join(", ")}</p>
                </div>
              </div>
            </motion.div>

            {/* Reviews Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mt-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Patient Reviews
              </h2>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-gray-100 pb-6 last:border-b-0"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">
                          {review.patient}
                        </span>
                        <div className="flex items-center ml-3">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 text-yellow-400 fill-current"
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {review.date}
                      </span>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Book Appointment
              </h3>

              {/* Date Selection */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Select Date</h4>
                <div className="grid grid-cols-1 gap-2">
                  {Object.keys(availableSlots).map((date) => (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        selectedDate === date
                          ? "border-primary bg-blue-50 text-primary"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {new Date(date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Select Time
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots[selectedDate].map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`p-2 rounded-lg border text-sm transition-colors ${
                          selectedTime === time
                            ? "border-primary bg-blue-50 text-primary"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {canBookAppointment ? (
                <button
                  onClick={handleBookAppointment}
                  disabled={!selectedDate || !selectedTime}
                  className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Book Appointment
                </button>
              ) : !isAuthenticated ? (
                <button
                  onClick={() => alert("Please log in as a patient to book appointments")}
                  className="w-full bg-gray-400 text-white py-3 rounded-lg font-medium cursor-not-allowed"
                >
                  Login to Book Appointment
                </button>
              ) : (
                <div className="w-full bg-gray-100 text-gray-600 py-3 rounded-lg font-medium text-center">
                  Doctors cannot book appointments
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
