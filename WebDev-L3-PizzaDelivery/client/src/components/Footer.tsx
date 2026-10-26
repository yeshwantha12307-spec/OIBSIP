import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Flame, ShieldCheck, Clock, MapPin, Phone, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-oasis-card border-t border-oasis-border/60 text-oasis-muted pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-oasis-red to-orange-600 flex items-center justify-center shadow-glow-red">
                <span className="text-lg">🍕</span>
              </div>
              <span className="font-serif text-2xl font-black tracking-tight text-white">
                OASIS <span className="text-oasis-amber font-sans font-light">PIZZA</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Authentic wood-fired Neapolitan and artisan craft pizzas baked at 450°C. Made with 48-hour slow-fermented dough and genuine imported Italian ingredients.
            </p>
            <div className="flex items-center gap-2 text-xs text-oasis-gold font-medium">
              <Flame className="w-4 h-4 text-oasis-red" />
              100% Wood-Stone Oven Baked Daily
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-bold text-white mb-4">Explore Menu</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/menu" className="hover:text-oasis-amber transition-colors">
                  Signature Craft Pizzas
                </Link>
              </li>
              <li>
                <Link to="/builder" className="hover:text-oasis-amber transition-colors flex items-center gap-1.5">
                  Custom Pizza Builder <span className="text-[10px] bg-oasis-red/20 text-oasis-red px-1.5 py-0.5 rounded font-bold">HOT</span>
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-oasis-amber transition-colors">
                  Live Order Tracker
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-oasis-amber transition-colors">
                  Customer Portal & Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Delivery & Hours */}
          <div>
            <h4 className="font-serif text-lg font-bold text-white mb-4">Kitchen Hours</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-oasis-amber mt-0.5 shrink-0" />
                <div>
                  <p className="text-slate-200 font-medium">Mon – Sun: 11:00 AM – 11:30 PM</p>
                  <p className="text-xs text-slate-400">Late night delivery available</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-slate-200 font-medium">Zero-Contact Hot Delivery</p>
                  <p className="text-xs text-slate-400">Thermal insulated carrier boxes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pizzeria Contacts & Internship Acknowledgement */}
          <div>
            <h4 className="font-serif text-lg font-bold text-white mb-4">Pizzeria Hub</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-oasis-red shrink-0" />
                <span>Oasis Tower, Culinary Boulevard</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-oasis-amber shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span>orders@oasispizza.com</span>
              </li>
            </ul>

            <div className="mt-4 p-3 rounded-xl bg-oasis-dark border border-white/5 text-xs text-slate-400">
              <span className="text-oasis-amber font-semibold block mb-0.5">Oasis Infobyte SIP</span>
              Level 3 Task — Web Development & Designing Full-Stack Architecture
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-oasis-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} Oasis Pizza. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Crafted with passion for pizza lovers
          </p>
        </div>
      </div>
    </footer>
  );
};
