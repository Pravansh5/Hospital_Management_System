import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../utils/api";

const BookingForm = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  // All state hooks must be declared at the top
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [appointmentType, setAppointmentType] = useState("in-person");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    reason: "",
    notes: "",
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Fetch available time slots callback - defined before useEffect
  const fetchAvailableSlots = useCallback(async () => {
    if (!selectedDate || !doctorId) return;
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found, user needs to log in");
        setAvailableTimes([]);
        return;
      }

      const response = await api.get(`/appointments/available/${doctorId}/${selectedDate}`);

      if (response.data.success) {
        const formattedTimes = response.data.data.availableSlots.map(slot => {
          const startTime = new Date(`2000-01-01T${slot.startTime}:00`);
          return startTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });
        });
        setAvailableTimes(formattedTimes);
      } else {
        setAvailableTimes([]);
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setAvailableTimes([]);
    }
  }, [selectedDate, doctorId]);

  // Fetch doctor data
  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        // Try to get specific doctor profile first
        const response = await api.get(`/provider/${doctorId}`);

        if (response.data.success && response.data.data) {
          const providerData = response.data.data;
          setDoctor({
            id: providerData.doctorId._id,
            name: providerData.doctorId.name,
            specialty: providerData.specialty,
            location: providerData.location || "Location not specified",
            image: "/api/placeholder/80/80",
            consultationFee: providerData.consultationFee,
            appointmentType: providerData.appointmentType,
          });
        } else {
          // Fallback: get all providers and find the specific doctor
          const allProvidersResponse = await api.get(`/provider`);

          if (allProvidersResponse.data.success && allProvidersResponse.data.data.providers) {
            const doctorProfile = allProvidersResponse.data.data.providers.find(
              (provider) => provider.doctorId._id === doctorId
            );
            
            if (doctorProfile) {
              setDoctor({
                id: doctorProfile.doctorId._id,
                name: doctorProfile.doctorId.name,
                specialty: doctorProfile.specialty,
                location: doctorProfile.location || "Location not specified",
                image: "/api/placeholder/80/80",
                consultationFee: doctorProfile.consultationFee,
                appointmentType: doctorProfile.appointmentType,
              });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching doctor data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchDoctorData();
    } else {
      setLoading(false);
    }
  }, [doctorId]);

  // Auto-fill user data if logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setIsLoggedIn(true);

        // Split full name into first and last name
        const nameParts = user.name ? user.name.split(" ") : ["", ""];
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        // Auto-fill form with user data
        setFormData((prevData) => ({
          ...prevData,
          firstName: firstName,
          lastName: lastName,
          email: user.email || "",
          phone: user.phone || "",
        }));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Check if user is authenticated and is a patient
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (!token || !userData) {
      alert("Please log in to book an appointment");
      navigate("/");
      return;
    }

    try {
      const user = JSON.parse(userData);
      if (user.role !== "patient") {
        alert("Only patients can book appointments");
        navigate("/");
        return;
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate("/");
    }
  }, [navigate]);

  // Generate available dates (next 7 days excluding weekends)
  useEffect(() => {
    const dates = [];
    const today = new Date();
    let currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() + 1); // Start from tomorrow
    
    while (dates.length < 7) {
      const dayOfWeek = currentDate.getDay();
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        dates.push(currentDate.toISOString().split('T')[0]);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    setAvailableDates(dates);
  }, []);

  // Fetch available time slots when date is selected
  useEffect(() => {
    if (selectedDate && doctorId) {
      fetchAvailableSlots();
    }
  }, [selectedDate, doctorId, fetchAvailableSlots]);

  // Show loading state while fetching doctor data
  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointment details...</p>
        </div>
      </div>
    );
  }

  // Show error if doctor not found
  if (!doctor) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Doctor Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The doctor you're looking for could not be found.
          </p>
          <button onClick={() => navigate("/")} className="btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Check if user is logged in
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      
      if (!token || !userData) {
        alert("Please log in to book an appointment");
        navigate("/");
        setSubmitting(false);
        return;
      }

      // Check if user is a patient
      const user = JSON.parse(userData);
      if (user.role !== "patient") {
        alert("Only patients can book appointments");
        setSubmitting(false);
        return;
      }

      // Validate form data
      if (!selectedDate || !selectedTime) {
        alert("Please select both date and time");
        setSubmitting(false);
        return;
      }

      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.reason) {
        alert("Please fill in all required fields");
        setSubmitting(false);
        return;
      }
      
      // Convert selected time to 24-hour format for API
      const timeIn24Hour = convertTo24Hour(selectedTime);
      const endTime = addMinutes(timeIn24Hour, 30); // 30-minute slots

      const appointmentData = {
        doctorId,
        date: selectedDate,
        timeSlot: {
          startTime: timeIn24Hour,
          endTime: endTime,
        },
        appointmentType,
        reason: formData.reason,
        specialRequirements: formData.notes ? { other: formData.notes } : undefined,
      };

      console.log("Booking appointment with data:", appointmentData);

      const response = await api.post("/appointments", appointmentData);

      if (response.data.success) {
        alert("Appointment booked successfully!");
        // Refresh available slots to remove the booked time
        await fetchAvailableSlots();
        navigate("/appointments");
      } else {
        alert(response.data.message || "Failed to book appointment");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to book appointment. Please try again.";
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to convert 12-hour time to 24-hour format
  const convertTo24Hour = (time12h) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  // Helper function to add minutes to time
  const addMinutes = (time, minutes) => {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-primary text-white p-6">
            <h1 className="text-2xl font-bold mb-2">Book Appointment</h1>
            <div className="flex items-center space-x-4">
              <img
                src={doctor.image}
                alt={doctor.name}
                className="w-12 h-12 rounded-full border-2 border-white"
              />
              <div>
                <h2 className="font-semibold">{doctor.name}</h2>
                <p className="text-blue-100">{doctor.specialty}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Appointment Type */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Appointment Type
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    appointmentType === "in-person"
                      ? "border-primary bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="appointmentType"
                    value="in-person"
                    checked={appointmentType === "in-person"}
                    onChange={(e) => setAppointmentType(e.target.value)}
                    className="sr-only"
                  />
                  <MapPin className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <div className="font-medium">In-Person Visit</div>
                    <div className="text-sm text-gray-600">
                      {doctor.location}
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    appointmentType === "telemedicine"
                      ? "border-primary bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="appointmentType"
                    value="telemedicine"
                    checked={appointmentType === "telemedicine"}
                    onChange={(e) => setAppointmentType(e.target.value)}
                    className="sr-only"
                  />
                  <Video className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <div className="font-medium">Video Call</div>
                    <div className="text-sm text-gray-600">
                      Online consultation
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Select Date
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {availableDates.map((date) => (
                  <button
                    key={date}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    className={`p-3 text-center border rounded-lg transition-all ${
                      selectedDate === date
                        ? "border-primary bg-primary text-white"
                        : "border-gray-200 hover:border-primary hover:bg-blue-50"
                    }`}
                  >
                    <div className="text-sm font-medium">
                      {new Date(date).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </div>
                    <div className="text-xs">
                      {new Date(date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Select Time
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`p-3 text-center border rounded-lg transition-all ${
                        selectedTime === time
                          ? "border-primary bg-primary text-white"
                          : "border-gray-200 hover:border-primary hover:bg-blue-50"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Patient Information */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Patient Information
                </h3>
                {isLoggedIn ? (
                  <div className="flex items-center text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
                    <User className="h-3 w-3 mr-1" />
                    Auto-filled from your profile
                  </div>
                ) : (
                  <div className="flex items-center text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                    <User className="h-3 w-3 mr-1" />
                    Sign in to auto-fill your details
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Visit
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Brief description of your concern"
                    required
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Any additional information you'd like to share"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedDate || !selectedTime || submitting}
                className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Booking..." : "Confirm Appointment"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default BookingForm;
