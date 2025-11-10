import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Save, Loader2, AlertCircle, CheckCircle } from "lucide-react";

const ProviderProfileSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    bio: "",
    specialty: "",
    experience: "",
    consultationFee: "",
    languages: "",
    location: "",
    appointmentType: "both",
    availability: [
      { day: "Monday", startTime: "09:00", endTime: "17:00" },
      { day: "Tuesday", startTime: "09:00", endTime: "17:00" },
      { day: "Wednesday", startTime: "09:00", endTime: "17:00" },
      { day: "Thursday", startTime: "09:00", endTime: "17:00" },
      { day: "Friday", startTime: "09:00", endTime: "17:00" },
    ],
  });

  useEffect(() => {
    // Check if user is logged in and is a doctor
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "doctor") {
      navigate("/");
      return;
    }

    setUser(parsedUser);

    // Check if doctor already has a profile
    checkExistingProfile(token);
  }, [navigate]);

  const checkExistingProfile = async (token) => {
    try {
      const response = await fetch("http://localhost:4000/api/provider/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Profile exists, populate form with existing data
          const profile = data.data;
          setFormData({
            bio: profile.bio || "",
            specialty: profile.specialty || "",
            experience: profile.experience || "",
            consultationFee: profile.consultationFee || "",
            languages: Array.isArray(profile.languages) ? profile.languages.join(", ") : "",
            location: profile.location || "",
            appointmentType: profile.appointmentType || "both",
            availability: profile.availability && profile.availability.length > 0 
              ? profile.availability 
              : [
                  { day: "Monday", startTime: "09:00", endTime: "17:00" },
                  { day: "Tuesday", startTime: "09:00", endTime: "17:00" },
                  { day: "Wednesday", startTime: "09:00", endTime: "17:00" },
                  { day: "Thursday", startTime: "09:00", endTime: "17:00" },
                  { day: "Friday", startTime: "09:00", endTime: "17:00" },
                ],
          });
        }
      }
    } catch (error) {
      console.error("Error checking existing profile:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvailabilityChange = (index, field, value) => {
    const updatedAvailability = [...formData.availability];
    updatedAvailability[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      availability: updatedAvailability,
    }));
  };

  const addAvailabilitySlot = () => {
    setFormData((prev) => ({
      ...prev,
      availability: [
        ...prev.availability,
        { day: "Monday", startTime: "09:00", endTime: "17:00" },
      ],
    }));
  };

  const removeAvailabilitySlot = (index) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login first");
        setLoading(false);
        return;
      }

      // Prepare data for API
      const profileData = {
        ...formData,
        experience: parseInt(formData.experience),
        consultationFee: parseFloat(formData.consultationFee),
        languages: formData.languages.split(",").map((lang) => lang.trim()),
      };

      const response = await fetch("http://localhost:4000/api/provider", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/doctors");
        }, 2000);
      } else {
        setError(data.message || "Failed to create profile");
      }
    } catch (err) {
      console.error("Error creating profile:", err);
      setError("Failed to create profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center p-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Profile Saved Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Your provider profile has been saved. Redirecting to doctors
            page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Provider Profile
            </h1>
            <p className="text-gray-600">
              Complete or update your profile to manage appointments
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialty *
                </label>
                <select
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="">Select your specialty</option>
                  <option value="Cardiologist">Cardiologist</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="Pediatrician">Pediatrician</option>
                  <option value="Neurologist">Neurologist</option>
                  <option value="Psychiatrist">Psychiatrist</option>
                  <option value="Primary Care">Primary Care</option>
                  <option value="Orthopedic">Orthopedic</option>
                  <option value="Gynecologist">Gynecologist</option>
                  <option value="Ophthalmologist">Ophthalmologist</option>
                  <option value="Dentist">Dentist</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., 5"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consultation Fee ($)
              </label>
              <input
                type="number"
                name="consultationFee"
                value={formData.consultationFee}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., 150"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., New York, NY"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Languages (comma-separated)
              </label>
              <input
                type="text"
                name="languages"
                value={formData.languages}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., English, Spanish"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Type
              </label>
              <select
                name="appointmentType"
                value={formData.appointmentType}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="in-person">In-person only</option>
                <option value="telemedicine">Telemedicine only</option>
                <option value="both">Both in-person and telemedicine</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Tell patients about your experience, approach to care, etc."
              />
            </div>

            {/* Availability */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Availability
                </label>
                <button
                  type="button"
                  onClick={addAvailabilitySlot}
                  className="text-primary hover:text-blue-600 text-sm font-medium"
                >
                  + Add Time Slot
                </button>
              </div>

              <div className="space-y-3">
                {formData.availability.map((slot, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <select
                      value={slot.day}
                      onChange={(e) =>
                        handleAvailabilityChange(index, "day", e.target.value)
                      }
                      className="p-2 border border-gray-200 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Sunday">Sunday</option>
                    </select>

                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) =>
                        handleAvailabilityChange(
                          index,
                          "startTime",
                          e.target.value
                        )
                      }
                      className="p-2 border border-gray-200 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                    />

                    <span className="text-gray-500">to</span>

                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) =>
                        handleAvailabilityChange(
                          index,
                          "endTime",
                          e.target.value
                        )
                      }
                      className="p-2 border border-gray-200 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                    />

                    <button
                      type="button"
                      onClick={() => removeAvailabilitySlot(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                      disabled={formData.availability.length === 1}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Saving Profile...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfileSetup;
