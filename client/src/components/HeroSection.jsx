import SearchBar from "./SearchBar";
import { Clock, Users, Star, Shield } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection = () => {
  const stats = [
    { icon: Users, value: "50,000+", label: "Trusted Doctors" },
    { icon: Clock, value: "24/7", label: "Available Support" },
    { icon: Shield, value: "100%", label: "Secure & Private" },
    { icon: Star, value: "4.9/5", label: "Patient Rating" },
  ];

  return (
    <section className="bg-gradient-to-br from-cream via-cream to-accent/20 min-h-[700px] flex items-center relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-primary/50 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            Empowering wellness, 
            <span className="text-primary block mt-2">inspiring life</span>
            <span className="text-gray-700">through precision and compassion.</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
            Search by specialty, location, or doctor name to find the perfect
            healthcare provider for your needs.
          </p>
        </div>

        <SearchBar />

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-16"
        >
          <p className="text-center text-gray-600 mb-8 text-lg">
            Join thousands of patients who trust MediCare for their healthcare
            needs
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                  className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-soft"
                >
                  <IconComponent className="h-8 w-8 text-primary mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
