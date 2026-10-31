import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Flame, ShieldCheck, Clock, MapPin, Phone, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#FFFCF7] border-t border-[#F2E8DC] text-[#765747] pt-16 pb-12 mt-20 shadow-warm-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#D92D20] to-[#A91F18] flex items-center justify-center shadow-glow-red">
                <span className="text-lg">🍕</span>
              </div>
              <span className="font-serif text-2xl font-black tracking-tight text-[#38251F]">
                OASIS <span className="text-[#D92D20] font-sans font-light">PIZZA</span>
              </span>
            </Link>
            <p className="text-sm text-[#765747] leading-relaxed">
              Authentic wood-fired Neapolitan and artisan craft pizzas baked at 450°C. Made with 48-hour slow-fermented dough and genuine imported Italian ingredients.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#D97706] font-bold">
              <Flame className="w-4 h-4 text-[#D92D20]" />
              100% Wood-Stone Oven Baked Daily
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-bold text-[#38251F] mb-4">Explore Menu</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/menu" className="hover:text-[#D92D20] transition-colors font-medium">
                  Signature Craft Pizzas
                </Link>
              </li>
              <li>
                <Link to="/builder" className="hover:text-[#D92D20] transition-colors flex items-center gap-1.5 font-medium">
                  Custom Pizza Builder <span className="text-[10px] bg-[#D92D20]/10 text-[#D92D20] px-1.5 py-0.5 rounded-full font-bold">STUDIO</span>
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-[#D92D20] transition-colors font-medium">
                  Live Order Tracker
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-[#D92D20] transition-colors font-medium">
                  Customer Portal & Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Delivery & Hours */}
          <div>
            <h4 className="font-serif text-lg font-bold text-[#38251F] mb-4">Kitchen Hours</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#D97706] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[#38251F] font-bold">Mon – Sun: 11:00 AM – 11:30 PM</p>
                  <p className="text-xs text-[#765747]">Late night delivery available</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#198754] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[#38251F] font-bold">Zero-Contact Hot Delivery</p>
                  <p className="text-xs text-[#765747]">Thermal insulated carrier boxes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pizzeria Contacts & Internship Acknowledgement */}
          <div>
            <h4 className="font-serif text-lg font-bold text-[#38251F] mb-4">Pizzeria Hub</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#D92D20] shrink-0" />
                <span>Oasis Tower, Culinary Boulevard</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D97706] shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#2563EB] shrink-0" />
                <span>orders@oasispizza.com</span>
              </li>
            </ul>

            <div className="mt-4 p-3 rounded-2xl bg-[#FFF8EF] border border-[#F2E8DC] text-xs text-[#765747]">
              <span className="text-[#D97706] font-bold block mb-0.5">Oasis Infobyte SIP</span>
              Level 3 Task — Web Development & Designing Full-Stack Platform
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#F2E8DC] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium">
          <p>© {new Date().getFullYear()} Oasis Pizza. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-[#765747]">
            Crafted with passion for pizza lovers
          </p>
        </div>
      </div>
    </footer>
  );
};
