import React from "react";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Send } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-10 px-6">
      <div className="max-w-7xl mx-20 grid grid-cols-1 md:grid-cols-3 gap-32">
        
        <div>
          <h2 className="text-2xl font-bold text-primary">RealtyX</h2>
          <p className="text-gray-400 mt-3">Your trusted real estate partner to find the perfect property.</p>
          <div className="flex gap-4 mt-4">
            <a href="/" className="text-gray-300 hover:text-purple-400 transition">
              <Facebook size={20} />
            </a>
            <a href="/" className="text-gray-300 hover:text-purple-400 transition">
              <Instagram size={20} />
            </a>
            <a href="/" className="text-gray-300 hover:text-purple-400 transition">
              <Twitter size={20} />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-primary">Quick Links</h3>
          <ul className="mt-3 space-y-2 text-gray-300">
            <li className="hover:text-white transition"><a href="/">For Sale</a></li>
            <li className="hover:text-white transition"><a href="/rent">For Rent</a></li>
            <li className="hover:text-white transition"><a href="/">Agent Finder</a></li>
            <li className="hover:text-white transition"><a href="/">Post Your Ad</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-primary">Contact Us</h3>
          <ul className="mt-3 space-y-3 text-gray-300">
            <li className="flex items-center gap-3">
              <MapPin size={18} className="text-purple-400" />
              123 Main Street, New York, USA
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-purple-400" />
              +1 234 567 890
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="text-purple-400" />
              realtyx@gmail.com
            </li>
          </ul>
        </div>

       
      </div>

      <div className="border-t border-gray-700 text-center text-gray-400 text-sm mt-8 pt-4">
        © {new Date().getFullYear()} RealtyX. All Rights Reserved.
      </div>
    </footer>
  );
}

export default Footer;
