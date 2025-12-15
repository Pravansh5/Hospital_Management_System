import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const footerLinks = {
    'For Patients': [
      { name: 'Find a Doctor', href: '/doctors' },
      { name: 'Book Appointment', href: '/doctors' },
      { name: 'Telemedicine', href: '#' },
      { name: 'Patient Portal', href: '#' },
      { name: 'Insurance', href: '#' }
    ],
    'For Providers': [
      { name: 'Join MediCare', href: '#' },
      { name: 'Provider Portal', href: '#' },
      { name: 'Resources', href: '#' },
      { name: 'Support', href: '#' },
      { name: 'Billing', href: '#' }
    ],
    'Company': [
      { name: 'About Us', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Press', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Contact', href: '#' }
    ],
    'Support': [
      { name: 'Help Center', href: '#' },
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Accessibility', href: '#' },
      { name: 'Security', href: '#' }
    ]
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Brand */}
          <Link to="/" className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="bg-primary p-2 rounded-xl">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">MediCare</span>
          </Link>

          {/* Links */}
          <div className="flex items-center space-x-6 mb-4 md:mb-0">
            <Link to="/doctors" className="text-gray-300 hover:text-white transition-colors text-sm">
              Find Doctors
            </Link>
            <Link to="#" className="text-gray-300 hover:text-white transition-colors text-sm">
              About
            </Link>
            <Link to="#" className="text-gray-300 hover:text-white transition-colors text-sm">
              Contact
            </Link>
            <Link to="#" className="text-gray-300 hover:text-white transition-colors text-sm">
              Privacy
            </Link>
          </div>

          {/* Copyright & Social */}
          <div className="flex items-center space-x-4">
            <span className="text-gray-400 text-sm">© 2024 MediCare</span>
            <div className="flex space-x-3">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label={social.name}
                  >
                    <IconComponent className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;