import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import DoctorListing from "./pages/DoctorListing";
import DoctorProfile from "./pages/DoctorProfile";
import BookingForm from "./pages/BookingForm";
import ProviderProfileSetup from "./pages/ProviderProfileSetup";
import ProvidersPage from "./pages/ProvidersPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import Dashboard from "./pages/Dashboard";
import Footer from "./components/Footer";
import LoginModal from "./components/LoginModal";
import SignupModal from "./components/SignupModal";
import DoctorSignupModal from "./components/DoctorSignupModal";
import { useState, useEffect, Component } from "react";
import "./App.css";

// Error Boundary Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showDoctorSignup, setShowDoctorSignup] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing authentication on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setShowLogin(false);
    // Force page refresh to update all components
    window.location.reload();
  };

  const handleSignup = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setShowSignup(false);

    // Redirect doctors to profile setup
    if (userData.role === "doctor") {
      window.location.href = "/provider/setup";
    }
  };

  const handleDoctorSignup = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setShowDoctorSignup(false);

    // Redirect doctors to profile setup
    window.location.href = "/provider/setup";
  };

  const handleSignupClick = (role = 'patient') => {
    if (role === 'doctor') {
      setShowDoctorSignup(true);
    } else {
      setShowSignup(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    // Force page refresh to clear all cached data
    window.location.href = "/";
  };

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-cream">
          <Navbar
            onLoginClick={() => setShowLogin(true)}
            onSignupClick={() => setShowSignup(true)}
            user={user}
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
          />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/doctors" element={<DoctorListing />} />
            <Route path="/doctor/:id" element={<DoctorProfile />} />
            <Route path="/book/:doctorId" element={<BookingForm />} />
            <Route path="/provider/setup" element={<ProviderProfileSetup />} />
            <Route path="/providers" element={<ProvidersPage onSignupClick={handleSignupClick} user={user} isAuthenticated={isAuthenticated} />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
          </Routes>
          <Footer />
          {showLogin && (
            <LoginModal
              onClose={() => setShowLogin(false)}
              onLogin={handleLogin}
            />
          )}
          {showSignup && (
            <SignupModal
              onClose={() => setShowSignup(false)}
              onSignup={handleSignup}
            />
          )}
          {showDoctorSignup && (
            <DoctorSignupModal
              onClose={() => setShowDoctorSignup(false)}
              onSignup={handleDoctorSignup}
            />
          )}
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
