import {
  Heart,
  Brain,
  Eye,
  Stethoscope,
  Baby,
  Bone,
  Pill,
  UserCheck,
  Zap,
  Activity,
  Smile,
  Ear,
} from "lucide-react";
import { Link } from "react-router-dom";

const specialties = [
  {
    name: "Primary Care",
    icon: Stethoscope,
    color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
    iconColor: "text-blue-600",
    count: "1,200+ doctors",
  },
  {
    name: "Dentist",
    icon: Smile,
    color: "bg-green-50 hover:bg-green-100 border-green-200",
    iconColor: "text-green-600",
    count: "800+ doctors",
  },
  {
    name: "Dermatologist",
    icon: UserCheck,
    color: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200",
    iconColor: "text-yellow-600",
    count: "450+ doctors",
  },
  {
    name: "Psychiatrist",
    icon: Brain,
    color: "bg-purple-50 hover:bg-purple-100 border-purple-200",
    iconColor: "text-purple-600",
    count: "320+ doctors",
  },
  {
    name: "Eye Doctor",
    icon: Eye,
    color: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200",
    iconColor: "text-indigo-600",
    count: "280+ doctors",
  },
  {
    name: "Cardiologist",
    icon: Heart,
    color: "bg-red-50 hover:bg-red-100 border-red-200",
    iconColor: "text-red-600",
    count: "190+ doctors",
  },
  {
    name: "Pediatrician",
    icon: Baby,
    color: "bg-pink-50 hover:bg-pink-100 border-pink-200",
    iconColor: "text-pink-600",
    count: "380+ doctors",
  },
  {
    name: "Orthopedist",
    icon: Bone,
    color: "bg-orange-50 hover:bg-orange-100 border-orange-200",
    iconColor: "text-orange-600",
    count: "220+ doctors",
  },
  {
    name: "Neurologist",
    icon: Zap,
    color: "bg-teal-50 hover:bg-teal-100 border-teal-200",
    iconColor: "text-teal-600",
    count: "150+ doctors",
  },
  {
    name: "Therapist",
    icon: Activity,
    color: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200",
    iconColor: "text-emerald-600",
    count: "420+ doctors",
  },
  {
    name: "ENT Doctor",
    icon: Ear,
    color: "bg-cyan-50 hover:bg-cyan-100 border-cyan-200",
    iconColor: "text-cyan-600",
    count: "180+ doctors",
  },
  {
    name: "Pharmacist",
    icon: Pill,
    color: "bg-violet-50 hover:bg-violet-100 border-violet-200",
    iconColor: "text-violet-600",
    count: "90+ doctors",
  },
];

const SpecialtySection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Top Searched Specialties
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find the right specialist for your healthcare needs
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {specialties.map((specialty) => {
            const IconComponent = specialty.icon;
            return (
              <div key={specialty.name}>
                <Link
                  to={`/doctors?specialty=${specialty.name.toLowerCase()}`}
                  className={`${specialty.color} border-2 p-6 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-lg block group`}
                >
                  <div className="text-center">
                    <div className="bg-white rounded-xl p-3 w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent
                        className={`h-8 w-8 ${specialty.iconColor}`}
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                      {specialty.name}
                    </h3>
                    <p className="text-sm text-gray-600 font-medium">
                      {specialty.count}
                    </p>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* View All Specialties */}
        <div className="text-center mt-12">
          <Link
            to="/doctors"
            className="inline-flex items-center px-8 py-4 bg-white border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
          >
            View All Specialties
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SpecialtySection;
