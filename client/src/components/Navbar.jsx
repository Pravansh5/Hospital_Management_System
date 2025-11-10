import { useState } from "react";
import {
  Menu,
  X,
  Heart,
  HelpCircle,
  Building2,
  User,
  LogOut,
  Calendar,
  LayoutDashboard,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Navbar = ({
  onLoginClick,
  onSignupClick,
  user,
  isAuthenticated,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    // Show dashboard only for authenticated users
    ...(isAuthenticated ? [{ name: "Dashboard", path: "/dashboard", icon: LayoutDashboard }] : []),
    { name: "Browse Doctors", path: "/doctors", icon: null },
    // Show appointments only for authenticated users
    ...(isAuthenticated ? [{ name: "My Appointments", path: "/appointments", icon: Calendar }] : []),
    { name: "Help", path: "#", icon: HelpCircle },
    // Only show "For Providers" to doctors or non-authenticated users
    ...(!isAuthenticated || user?.role === "doctor" ? [{ name: "For Providers", path: "/providers", icon: Building2 }] : []),
  ];

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-soft border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-primary p-2 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                MediCare
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-1">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center space-x-1 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-xl ${
                      isActivePath(item.path)
                        ? "text-primary bg-blue-50"
                        : "text-gray-700 hover:text-primary hover:bg-gray-50"
                    }`}
                    onClick={() => console.log('Navigating to:', item.path, item.name)}
                  >
                    {IconComponent && <IconComponent className="h-4 w-4" />}
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              <div className="flex items-center space-x-3 ml-6 pl-6 border-l border-gray-200">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 text-gray-700">
                      <User className="h-4 w-4" />
                      <span className="text-sm font-medium">{user?.name}</span>
                    </div>
                    <button
                      onClick={onLogout}
                      className="flex items-center space-x-1 text-gray-700 hover:text-red-600 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-xl hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={onLoginClick}
                      className="text-gray-700 hover:text-primary px-4 py-2 text-sm font-medium transition-all duration-200 rounded-xl hover:bg-gray-50"
                    >
                      Login
                    </button>
                    <button
                      onClick={onSignupClick}
                      className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-hover transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 p-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-3 text-base font-medium rounded-xl transition-colors ${
                    isActivePath(item.path)
                      ? "text-primary bg-blue-50"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {IconComponent && <IconComponent className="h-5 w-5" />}
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <div className="pt-4 border-t border-gray-100 space-y-2">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 px-3 py-2 text-gray-700">
                    <User className="h-5 w-5" />
                    <span className="text-base font-medium">{user?.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center space-x-2 w-full text-left px-3 py-3 text-base font-medium text-red-600 rounded-xl hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => {
                      onLoginClick();
                      setIsOpen(false);
                    }}
                    className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 rounded-xl hover:bg-gray-50"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      onSignupClick();
                      setIsOpen(false);
                    }}
                    className="w-full bg-primary text-white px-3 py-3 rounded-xl text-base font-semibold hover:bg-primary-hover transition-colors"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
