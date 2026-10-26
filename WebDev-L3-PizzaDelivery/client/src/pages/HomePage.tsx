import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Layers,
  ChefHat,
  ChevronRight,
} from 'lucide-react';
import { PizzaCard } from '../components/PizzaCard.js';
import { Pizza } from '../types/index.js';
import { api } from '../api/client.js';

export const HomePage: React.FC = () => {
  const [featuredPizzas, setFeaturedPizzas] = useState<Pizza[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPizzas = async () => {
      try {
        const res = await api.get('/pizzas');
        if (res.success && Array.isArray(res.data)) {
          setFeaturedPizzas(res.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load menu pizzas:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPizzas();
  }, []);

  return (
    <div className="space-y-24">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
        {/* Ambient atmospheric lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-oasis-red/20 via-oasis-amber/15 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-oasis-red/10 border border-oasis-red/30 text-oasis-red text-xs font-semibold uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-oasis-red animate-pulse" />
                Artisan Wood-Fired Pizzeria
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.08] tracking-tight">
                Authentic Craft Pizza, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-oasis-amber via-oasis-red to-orange-500">
                  Baked to Perfection.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
                Indulge in 48-hour slow-fermented Neapolitan sourdough dough, imported San Marzano tomatoes, and bubbling mozzarella melted over intense 450°C stone oven heat. Build your custom creation or order signature recipes.
              </p>

              {/* CTA Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/builder"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-oasis-red hover:bg-oasis-red-hover text-white font-bold text-base flex items-center justify-center gap-3 shadow-glow-red hover:scale-105 active:scale-95 transition-all"
                >
                  <Flame className="w-5 h-5 text-oasis-gold" />
                  Build Custom Pizza
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/menu"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-oasis-border bg-oasis-card/80 hover:bg-oasis-card text-white font-semibold text-base flex items-center justify-center gap-2 hover:border-oasis-amber/50 transition-all"
                >
                  Explore Craft Menu
                </Link>
              </div>

              {/* Fast Delivery & Trust Highlights */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-oasis-border/60 max-w-lg mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <span className="font-serif text-2xl font-bold text-white block">450°C</span>
                  <span className="text-xs text-oasis-muted">Stone Oven Bake</span>
                </div>
                <div className="text-center lg:text-left border-x border-oasis-border/60 px-4">
                  <span className="font-serif text-2xl font-bold text-oasis-amber block">30 Mins</span>
                  <span className="text-xs text-oasis-muted">Average Delivery</span>
                </div>
                <div className="text-center lg:text-left">
                  <span className="font-serif text-2xl font-bold text-emerald-400 block">100%</span>
                  <span className="text-xs text-oasis-muted">Pure Mozzarella</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Pizza Showcase */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-square">
                {/* Rotating Outer Glow */}
                <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-oasis-red/40 via-oasis-amber/30 to-amber-600/40 blur-2xl animate-pulse"></div>

                {/* Hero Pizza Image */}
                <img
                  src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1000&q=80"
                  alt="Oasis Signature Wood Fired Pizza"
                  className="relative z-10 w-full h-full object-cover rounded-full shadow-[0_25px_50px_rgba(0,0,0,0.8)] border-4 border-oasis-card hover:rotate-6 transition-transform duration-700"
                />

                {/* Floating Hot Badge */}
                <div className="absolute -bottom-2 -left-2 z-20 bg-oasis-card/90 backdrop-blur-md border border-oasis-border p-4 rounded-2xl shadow-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-oasis-red/20 text-oasis-red flex items-center justify-center">
                    <ChefHat className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-oasis-muted font-medium">Chef's Specialty</p>
                    <p className="text-sm font-bold text-white">48h Fermented Dough</p>
                  </div>
                </div>

                {/* Floating Temperature Badge */}
                <div className="absolute -top-2 -right-2 z-20 bg-oasis-card/90 backdrop-blur-md border border-oasis-border p-3.5 rounded-2xl shadow-xl flex items-center gap-2.5">
                  <Flame className="w-5 h-5 text-oasis-amber" />
                  <span className="text-xs font-bold text-white">450°C Stone Oven</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Value Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-oasis-card border border-oasis-border/60 hover:border-oasis-red/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-oasis-red/10 text-oasis-red flex items-center justify-center mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-white mb-2">5 Bases & 5 Sauces</h3>
            <p className="text-sm text-oasis-muted leading-relaxed">
              From Italian Thin Crust to Double Cheese Burst and fresh Cauliflower crust, paired with craft sauces.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-oasis-card border border-oasis-border/60 hover:border-oasis-amber/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-oasis-amber/10 text-oasis-amber flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-white mb-2">Handmade Daily</h3>
            <p className="text-sm text-oasis-muted leading-relaxed">
              Every dough ball is hand-stretched and fire-baked upon your order. Zero artificial additives.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-oasis-card border border-oasis-border/60 hover:border-emerald-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-white mb-2">Razorpay Test Pay</h3>
            <p className="text-sm text-oasis-muted leading-relaxed">
              Secure, instant sandbox payments with cryptographic signature verification and atomic stock validation.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-oasis-card border border-oasis-border/60 hover:border-sky-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-white mb-2">Live Order Tracking</h3>
            <p className="text-sm text-oasis-muted leading-relaxed">
              Watch your pizza progress from kitchen prep to hot delivery with automated live status polling.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Featured Chef's Craft Pizzas */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold text-oasis-red uppercase tracking-widest block mb-2">
              Signature Menu
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              Chef’s Recommendations
            </h2>
          </div>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 text-sm font-semibold text-oasis-amber hover:text-white transition-colors"
          >
            Browse Complete Menu
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 rounded-2xl bg-oasis-card animate-pulse border border-oasis-border/40"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPizzas.map((pizza) => (
              <PizzaCard key={pizza._id} pizza={pizza} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Custom Pizza Builder Teaser Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-oasis-card via-oasis-card to-oasis-dark border border-oasis-border p-8 sm:p-12 lg:p-16">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-oasis-red/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-oasis-amber/20 text-oasis-amber border border-oasis-amber/30 uppercase tracking-wider inline-block">
                Interactive Pizzeria Experience
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-black text-white leading-tight">
                Be the Master Pizzaiolo. <br />
                <span className="text-oasis-red">Design Your Own Custom Pizza.</span>
              </h2>
              <p className="text-slate-300 text-base leading-relaxed max-w-xl">
                Choose your favorite crust, select artisanal sauces, pick gooey cheeses, and load fresh farm vegetables with live visualizer feedback and transparent server-calculated pricing.
              </p>
              <div className="pt-2">
                <Link
                  to="/builder"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-oasis-amber hover:bg-amber-500 text-oasis-dark font-extrabold text-base shadow-lg transition-all active:scale-95"
                >
                  <Flame className="w-5 h-5 text-oasis-dark" />
                  Launch Pizza Builder Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="w-48 h-48 sm:w-60 sm:h-60 rounded-full border-4 border-oasis-amber/30 bg-oasis-dark p-3 shadow-2xl flex items-center justify-center animate-spin-slow">
                <span className="text-8xl">🍕</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-xs font-bold text-oasis-red uppercase tracking-widest block mb-2">
          Simple 4-Step Process
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-14">
          From Our Stone Oven to Your Door
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="relative p-6 rounded-2xl bg-oasis-card border border-oasis-border/60">
            <span className="font-serif text-5xl font-black text-oasis-red/20 absolute top-4 right-4">01</span>
            <div className="w-12 h-12 rounded-xl bg-oasis-red/10 text-oasis-red flex items-center justify-center mb-4 mx-auto">
              <Flame className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-base mb-2">Select or Customize</h4>
            <p className="text-xs text-oasis-muted leading-relaxed">
              Choose from signature craft pizzas or handpick crust, sauce, cheese, and toppings.
            </p>
          </div>

          <div className="relative p-6 rounded-2xl bg-oasis-card border border-oasis-border/60">
            <span className="font-serif text-5xl font-black text-oasis-amber/20 absolute top-4 right-4">02</span>
            <div className="w-12 h-12 rounded-xl bg-oasis-amber/10 text-oasis-amber flex items-center justify-center mb-4 mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-base mb-2">Razorpay Test Pay</h4>
            <p className="text-xs text-oasis-muted leading-relaxed">
              Fast, sandbox payment test verification with instant cryptographic signature confirmation.
            </p>
          </div>

          <div className="relative p-6 rounded-2xl bg-oasis-card border border-oasis-border/60">
            <span className="font-serif text-5xl font-black text-orange-500/20 absolute top-4 right-4">03</span>
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center mb-4 mx-auto">
              <ChefHat className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-base mb-2">450°C Stone Oven Bake</h4>
            <p className="text-xs text-oasis-muted leading-relaxed">
              Our chefs fire your pizza over stone deck ovens until the crust is blistered and golden.
            </p>
          </div>

          <div className="relative p-6 rounded-2xl bg-oasis-card border border-oasis-border/60">
            <span className="font-serif text-5xl font-black text-emerald-500/20 absolute top-4 right-4">04</span>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-base mb-2">Live Status Tracking</h4>
            <p className="text-xs text-oasis-muted leading-relaxed">
              Track your delivery rider in real time with live polling order updates.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
