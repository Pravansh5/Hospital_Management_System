import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Users,
  Calendar,
  TrendingUp,
  Shield,
  CheckCircle,
  Star,
  Clock,
  Smartphone,
  Award,
} from "lucide-react";
import { motion } from "framer-motion";

const ProvidersPage = ({ onSignupClick, user, isAuthenticated }) => {
  const navigate = useNavigate();

  const handleJoinAsProvider = () => {
    if (isAuthenticated && user?.role === "doctor") {
      // Redirect existing doctors to profile setup
      navigate("/provider/setup");
    } else {
      // Show signup modal for non-authenticated users
      onSignupClick && onSignupClick('doctor');
    }
  };


  const benefits = [
    {
      icon: Users,
      title: "Expand Your Practice",
      description: "Reach thousands of new patients through our platform",
    },
    {
      icon: Calendar,
      title: "Easy Scheduling",
      description: "Automated appointment management and reminders",
    },
    {
      icon: TrendingUp,
      title: "Grow Your Revenue",
      description: "Increase patient volume and optimize your practice",
    },
    {
      icon: Shield,
      title: "Secure & Compliant",
      description: "HIPAA-compliant platform with secure patient data",
    },
  ];

  const features = [
    "Online appointment booking",
    "Patient management system",
    "Automated reminders & notifications",
    "Telemedicine capabilities",
    "Payment processing",
    "Patient reviews & ratings",
    "Analytics & reporting",
    "Multi-device access",
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      content:
        "MediCare has transformed my practice. I've seen a 40% increase in patient volume and the platform makes scheduling effortless.",
      rating: 5,
      patients: "500+ patients",
    },
    {
      name: "Dr. Michael Chen",
      specialty: "Dermatologist",
      content:
        "The telemedicine feature has been a game-changer. I can now provide care to patients who couldn't visit my office.",
      rating: 5,
      patients: "300+ patients",
    },
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-hover text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Building2 className="h-16 w-16 mx-auto mb-6 text-white/90" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Join MediCare
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Grow your practice, reach more patients, and provide better care
              with our comprehensive healthcare platform.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleJoinAsProvider}
                className="bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                {isAuthenticated && user?.role === "doctor" ? "Complete Your Profile" : "Join as a Provider"}
              </button>
              <a
                href="#learn-more"
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-primary transition-colors duration-200"
              >
                Learn More
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white" id="learn-more">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose MediCare?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of healthcare providers who trust our platform to
              grow their practice.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors duration-300"
                >
                  <div className="bg-primary/10 rounded-2xl p-4 w-fit mx-auto mb-6">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProvidersPage;
