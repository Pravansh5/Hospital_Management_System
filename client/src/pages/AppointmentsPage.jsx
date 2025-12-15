import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, User, Phone, Mail, Filter, Eye, X, Video, Star } from "lucide-react";
import { motion } from "framer-motion";
import toast from 'react-hot-toast';
import api from "../utils/api";

const AppointmentsPage = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [user, setUser] = useState(null);
  const [ratingData, setRatingData] = useState({
    rating: 0,
    title: "",
    comment: "",
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    
    if (!token || !userData) {
      navigate("/");
      return;
    }
    
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchAppointments();
  }, [filter, navigate]);

  // Refresh data when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchAppointments();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const url = filter === "all" 
        ? "/appointments/my" 
        : `/appointments/my?status=${filter}`;
      
      const response = await api.get(url);

      if (response.data.success) {
        setAppointments(response.data.data.appointments);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      if (error.response?.status === 401) {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      const response = await api.patch(`/appointments/${appointmentId}/status`, { status });

      if (response.data.success) {
        fetchAppointments();
        setShowModal(false);
        toast.success('Appointment status updated successfully!');
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error(error.response?.data?.message || 'Failed to update appointment status');
    }
  };

  const handleRateDoctor = (appointment) => {
    setSelectedAppointment(appointment);
    setRatingData({ rating: 0, title: "", comment: "" });
    setShowRatingModal(true);
  };

  const submitRating = async () => {
    try {
      if (ratingData.rating === 0) {
        toast.error('Please select a rating');
        return;
      }
      if (!ratingData.title || !ratingData.comment) {
        toast.error('Please fill in all fields');
        return;
      }

      const response = await api.post('/review', {
        appointmentId: selectedAppointment._id,
        rating: ratingData.rating,
        title: ratingData.title,
        comment: ratingData.comment,
      });

      if (response.data.success) {
        toast.success('Review submitted successfully!');
        setShowRatingModal(false);
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const canCompleteAppointment = (appointment) => {
    const appointmentDateTime = new Date(appointment.date);
    const [hours, minutes] = appointment.timeSlot.startTime.split(':');
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return new Date() >= appointmentDateTime;
  };

  const filteredAppointments = appointments.filter((appointment) => {
    if (filter === "all") return true;
    return appointment.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
          <p className="text-gray-600">Manage and view all your appointments</p>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex flex-wrap gap-2">
          {["all", "pending", "confirmed", "completed", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? "bg-primary text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600">
              {filter === "all" 
                ? "You haven't booked any appointments yet." 
                : `No ${filter} appointments found.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredAppointments.map((appointment, index) => (
              <motion.div
                key={appointment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          {user?.role === 'doctor' 
                            ? `Patient: ${appointment.patient?.name || "Unknown Patient"}`
                            : `Dr. ${appointment.doctor?.name || "Unknown Doctor"}`
                          }
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>
                          {formatTime(appointment.timeSlot.startTime)} - {formatTime(appointment.timeSlot.endTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="text-sm">Type: {appointment.appointmentType}</span>
                      </div>
                    </div>

                    {appointment.reason && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">
                          <strong>Reason:</strong> {appointment.reason}
                        </p>
                      </div>
                    )}

                    {appointment.status === "confirmed" && appointment.meetingLink && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Video className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Meeting Link</span>
                        </div>
                        <a
                          href={appointment.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                        >
                          {appointment.meetingLink}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {appointment.status === "pending" && user?.role === "doctor" && (
                      <button
                        onClick={() => updateAppointmentStatus(appointment._id, "confirmed")}
                        className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        Confirm
                      </button>
                    )}
                    {appointment.status === "confirmed" && user?.role === "doctor" && (
                      <button
                        onClick={() => updateAppointmentStatus(appointment._id, "completed")}
                        disabled={!canCompleteAppointment(appointment)}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                          canCompleteAppointment(appointment)
                            ? "text-blue-600 hover:bg-blue-50"
                            : "text-gray-400 cursor-not-allowed bg-gray-50"
                        }`}
                        title={!canCompleteAppointment(appointment) ? "Cannot complete before scheduled time" : ""}
                      >
                        Complete
                      </button>
                    )}
                    {appointment.status === "completed" && user?.role === "patient" && (
                      appointment.reviewed ? (
                        <span className="px-3 py-1 text-sm text-green-600 bg-green-50 rounded-lg flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          Reviewed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRateDoctor(appointment)}
                          className="px-3 py-1 text-sm text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Star className="h-3 w-3" />
                          Rate
                        </button>
                      )
                    )}
                    {appointment.status === "pending" && (
                      <button
                        onClick={() => updateAppointmentStatus(appointment._id, "cancelled")}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Rating Modal */}
        {showRatingModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Rate Dr. {selectedAppointment.doctor?.name}</h3>
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingData({ ...ratingData, rating: star })}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= ratingData.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Title</label>
                  <input
                    type="text"
                    value={ratingData.title}
                    onChange={(e) => setRatingData({ ...ratingData, title: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Brief summary of your experience"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Comment</label>
                  <textarea
                    value={ratingData.comment}
                    onChange={(e) => setRatingData({ ...ratingData, comment: e.target.value })}
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Share your experience with this doctor"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  onClick={submitRating}
                  className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-hover transition-colors"
                >
                  Submit Review
                </button>
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Appointment Details Modal */}
        {showModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Appointment Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {user?.role === 'doctor' ? 'Patient' : 'Doctor'}
                  </label>
                  <p className="text-gray-900">
                    {user?.role === 'doctor' 
                      ? selectedAppointment.patient?.name || "Unknown Patient"
                      : `Dr. ${selectedAppointment.doctor?.name || "Unknown Doctor"}`
                    }
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Date & Time</label>
                  <p className="text-gray-900">
                    {formatDate(selectedAppointment.date)} at{" "}
                    {formatTime(selectedAppointment.timeSlot.startTime)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>
                    {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                  </span>
                </div>

                {selectedAppointment.reason && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Reason</label>
                    <p className="text-gray-900">{selectedAppointment.reason}</p>
                  </div>
                )}

                {selectedAppointment.specialRequirements && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Special Requirements</label>
                    <p className="text-gray-900">{selectedAppointment.specialRequirements}</p>
                  </div>
                )}

                {selectedAppointment.doctor?.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Doctor Contact</label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <Mail className="h-4 w-4" />
                      <span>{selectedAppointment.doctor.email}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-2">
                {selectedAppointment.status === "pending" && user?.role === "doctor" && (
                  <button
                    onClick={() => updateAppointmentStatus(selectedAppointment._id, "confirmed")}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Confirm
                  </button>
                )}
                {selectedAppointment.status === "confirmed" && user?.role === "doctor" && (
                  <button
                    onClick={() => updateAppointmentStatus(selectedAppointment._id, "completed")}
                    disabled={!canCompleteAppointment(selectedAppointment)}
                    className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                      canCompleteAppointment(selectedAppointment)
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    title={!canCompleteAppointment(selectedAppointment) ? "Cannot complete before scheduled time" : ""}
                  >
                    Mark as Completed
                  </button>
                )}
                {selectedAppointment.status === "pending" && (
                  <button
                    onClick={() => updateAppointmentStatus(selectedAppointment._id, "cancelled")}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Cancel Appointment
                  </button>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;