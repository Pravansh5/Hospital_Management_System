import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: "http://localhost:4000/api", // Backend server URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Only redirect if not already on home page
      if (window.location.pathname !== '/') {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  logout: () => api.post("/auth/logout"),
};

// Other API calls can be added here as needed
export const appointmentAPI = {
  getMyAppointments: () => api.get("/appointments/my"),
  createAppointment: (data) => api.post("/appointments", data),
  updateAppointmentStatus: (id, data) => api.patch(`/appointments/${id}/status`, data),
  deleteAppointment: (id) => api.delete(`/appointments/${id}`),
  getAvailableSlots: (doctorId, date) => api.get(`/appointments/available/${doctorId}/${date}`),
};

export const providerAPI = {
  getProviders: () => api.get("/provider"),
  getProviderById: (id) => api.get(`/provider/${id}`),
};

// Calendar API calls
export const calendarAPI = {
  syncAppointmentToCalendar: (appointmentId, providers) => 
    api.post(`/calendar/sync/${appointmentId}`, { providers }),
  createCalendarEvent: (appointmentId, provider) => 
    api.post("/calendar/event", { appointmentId, provider }),
  updateCalendarEvent: (appointmentId, provider) => 
    api.put("/calendar/event", { appointmentId, provider }),
  deleteCalendarEvent: (appointmentId, provider) => 
    api.delete("/calendar/event", { data: { appointmentId, provider } }),
  getCalendarEvents: (provider = "google", timeMin) => 
    api.get("/calendar/events", { params: { provider, timeMin } }),
  downloadICalFile: (appointmentId) => 
    api.get(`/calendar/ical/${appointmentId}`, { responseType: 'text' }),
  getCalendarProviders: () => api.get("/calendar/providers"),
  getGoogleAuthUrl: () => api.get("/calendar/google/auth"),
};

// Add calendar methods to appointmentAPI for convenience
appointmentAPI.syncAppointmentToCalendar = calendarAPI.syncAppointmentToCalendar;
appointmentAPI.getCalendarEvents = calendarAPI.getCalendarEvents;
appointmentAPI.getCalendarProviders = calendarAPI.getCalendarProviders;
appointmentAPI.getGoogleAuthUrl = calendarAPI.getGoogleAuthUrl;
appointmentAPI.downloadICalFile = calendarAPI.downloadICalFile;

export default api;
