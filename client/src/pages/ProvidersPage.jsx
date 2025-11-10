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

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Everything You Need to Succeed
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Our comprehensive platform provides all the tools you need to
                manage your practice efficiently and grow your patient base.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl p-8 shadow-card"
            >
              <div className="text-center mb-8">
                <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Join Today
                </h3>
                <p className="text-gray-600">
                  Start growing your practice in minutes
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Setup Fee</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Monthly Fee</span>
                  <span className="font-semibold">$29/month</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Commission</span>
                  <span className="font-semibold">3% per booking</span>
                </div>
              </div>

              <button
                onClick={handleJoinAsProvider}
                className="w-full bg-primary text-white py-4 rounded-xl font-semibold hover:bg-primary-hover transition-colors duration-200 shadow-md hover:shadow-lg text-center mt-6"
              >
                {isAuthenticated && user?.role === "doctor" ? "Complete Your Profile" : "Get Started Now"}
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              What Providers Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hear from healthcare providers who have transformed their practice
              with MediCare.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 shadow-card"
              >
                <div className="flex items-center mb-4">
                  {Array.from({ length: testimonial.rating }, (_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {testimonial.specialty}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {testimonial.patients}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Grow Your Practice?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of healthcare providers who are already using
              MediCare to reach more patients and provide better care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleJoinAsProvider}
                className="bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                {isAuthenticated && user?.role === "doctor" ? "Complete Your Profile" : "Join MediCare Today"}
              </button>
              <a
                href="mailto:providers@medicare.com"
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-primary transition-colors duration-200"
              >
                Contact Sales
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ProvidersPage;
