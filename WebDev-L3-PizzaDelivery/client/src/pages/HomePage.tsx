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
  Star,
  CheckCircle2,
  Tag,
} from 'lucide-react';
import { PizzaCard } from '../components/PizzaCard.js';
import { PizzaCardSkeleton } from '../components/SkeletonLoader.js';
import { DealsCarousel } from '../components/DealsCarousel.js';
import { Pizza } from '../types/index.js';
import { api } from '../api/client.js';

export const HomePage: React.FC = () => {
  const [featuredPizzas, setFeaturedPizzas] = useState<Pizza[]>([]);
  const [allPizzas, setAllPizzas] = useState<Pizza[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPizzas = async () => {
      try {
        const res = await api.get('/pizzas');
        if (res.success && Array.isArray(res.data)) {
          setAllPizzas(res.data);
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
    <div className="space-y-20 pb-16 overflow-hidden">
      {/* 1. Hero Section (Artisan Wood-Fired QSR Style) */}
      <section className="relative overflow-hidden pt-8 pb-14 lg:pt-14 lg:pb-20">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-[#D92D20]/10 via-[#F59E0B]/12 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D92D20]/10 border border-[#D92D20]/25 text-[#D92D20] text-xs font-bold uppercase tracking-wider shadow-sm">
                <Flame className="w-4 h-4 text-[#D92D20] animate-pulse" />
                Artisan Wood-Stone Pizzeria
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-black text-[#38251F] leading-[1.08] tracking-tight">
                Authentic Craft Pizza, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D92D20] via-[#A91F18] to-[#D97706]">
                  Baked to Perfection.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#765747] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Indulge in 48-hour slow-fermented Neapolitan sourdough dough, imported San Marzano tomatoes, and bubbling mozzarella melted over intense 450°C stone oven heat. Build your custom creation or order signature recipes.
              </p>

              {/* CTA Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/builder"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#D92D20] hover:bg-[#A91F18] text-white font-extrabold text-base flex items-center justify-center gap-3 shadow-glow-red hover:scale-105 active:scale-95 transition-all"
                >
                  <Flame className="w-5 h-5 text-[#FEF3C7]" />
                  <span>Build Custom Pizza</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/menu"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-[#F2E8DC] bg-[#FFFCF7] hover:bg-[#F2E8DC]/50 text-[#38251F] font-bold text-base flex items-center justify-center gap-2 transition-all shadow-warm-sm"
                >
                  Explore Craft Menu
                </Link>
              </div>

              {/* Fast Delivery & Trust Highlights */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-[#F2E8DC] max-w-lg mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <span className="font-serif text-2xl font-black text-[#38251F] block">450°C</span>
                  <span className="text-xs text-[#765747] font-medium">Stone Oven Bake</span>
                </div>
                <div className="text-center lg:text-left border-x border-[#F2E8DC] px-4">
                  <span className="font-serif text-2xl font-black text-[#D97706] block">30 Mins</span>
                  <span className="text-xs text-[#765747] font-medium">Fast Delivery</span>
                </div>
                <div className="text-center lg:text-left">
                  <span className="font-serif text-2xl font-black text-[#198754] block">100%</span>
                  <span className="text-xs text-[#765747] font-medium">Pure Mozzarella</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Pizza Showcase */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-square">
                <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-[#D92D20]/25 via-[#D97706]/20 to-[#A91F18]/25 blur-2xl animate-pulse" />

                <img
                  src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1000&q=80"
                  alt="Oasis Signature Wood Fired Pizza"
                  className="relative z-10 w-full h-full object-cover rounded-full shadow-warm-lg border-8 border-[#FFFCF7] hover:rotate-6 transition-transform duration-700 select-none"
                />

                <div className="absolute -bottom-2 -left-2 z-20 bg-[#FFFCF7]/95 backdrop-blur-md border border-[#F2E8DC] p-4 rounded-3xl shadow-warm-lg flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#D92D20]/15 text-[#D92D20] flex items-center justify-center">
                    <ChefHat className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[11px] text-[#765747] font-bold uppercase tracking-wider">Chef's Specialty</p>
                    <p className="text-sm font-extrabold text-[#38251F]">48h Fermented Dough</p>
                  </div>
                </div>

                <div className="absolute -top-2 -right-2 z-20 bg-[#FFFCF7]/95 backdrop-blur-md border border-[#F2E8DC] p-3.5 rounded-2xl shadow-warm-lg flex items-center gap-2.5">
                  <Flame className="w-5 h-5 text-[#D97706]" />
                  <span className="text-xs font-bold text-[#38251F]">450°C Stone Oven</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. KFC-Style Value Deals & Hot Combos Bucket */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DealsCarousel pizzas={allPizzas} />
      </section>

      {/* 3. Featured Chef's Craft Pizzas */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#D92D20] uppercase tracking-widest block mb-2">
              Signature Menu
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-black text-[#38251F]">
              Chef’s Recommendations
            </h2>
          </div>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#D92D20] hover:text-[#A91F18] transition-colors"
          >
            Browse Complete Menu
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <PizzaCardSkeleton key={n} />
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
        <div className="relative overflow-hidden rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] p-8 sm:p-12 lg:p-16 shadow-warm-lg">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-[#D92D20]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706] border border-[#D97706]/30 uppercase tracking-wider inline-block shadow-sm">
                Interactive Pizza Studio
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-black text-[#38251F] leading-tight">
                Be the Master Pizzaiolo. <br />
                <span className="text-[#D92D20]">Design Your Own Custom Pizza.</span>
              </h2>
              <p className="text-[#765747] text-base leading-relaxed max-w-xl font-normal">
                Choose your favorite crust, select artisanal sauces, pick gooey cheeses, and load fresh farm vegetables with live dynamic SVG visualizer feedback and transparent server-calculated pricing.
              </p>
              <div className="pt-2">
                <Link
                  to="/builder"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#D92D20] hover:bg-[#A91F18] text-white font-extrabold text-base shadow-glow-red transition-all active:scale-95"
                >
                  <Flame className="w-5 h-5 text-[#FEF3C7]" />
                  <span>Launch Pizza Builder Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="w-48 h-48 sm:w-60 sm:h-60 rounded-full border-8 border-[#FFF8EF] bg-[#FFFCF7] p-4 shadow-warm-lg flex items-center justify-center animate-spin-slow select-none">
                <span className="text-8xl">🍕</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-xs font-bold text-[#D92D20] uppercase tracking-widest block mb-2">
          Simple 4-Step Process
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-black text-[#38251F] mb-14">
          From Our Stone Oven to Your Door
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="relative p-7 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] shadow-warm-sm">
            <span className="font-serif text-5xl font-black text-[#D92D20]/15 absolute top-4 right-4">01</span>
            <div className="w-12 h-12 rounded-2xl bg-[#D92D20]/10 text-[#D92D20] flex items-center justify-center mb-4 mx-auto">
              <Flame className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-[#38251F] text-lg mb-2">Select or Customize</h4>
            <p className="text-xs text-[#765747] leading-relaxed">
              Choose from signature craft pizzas or handpick crust, sauce, cheese, and toppings.
            </p>
          </div>

          <div className="relative p-7 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] shadow-warm-sm">
            <span className="font-serif text-5xl font-black text-[#D97706]/15 absolute top-4 right-4">02</span>
            <div className="w-12 h-12 rounded-2xl bg-[#D97706]/10 text-[#D97706] flex items-center justify-center mb-4 mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-[#38251F] text-lg mb-2">Razorpay Test Pay</h4>
            <p className="text-xs text-[#765747] leading-relaxed">
              Fast, sandbox payment test verification with instant cryptographic signature confirmation.
            </p>
          </div>

          <div className="relative p-7 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] shadow-warm-sm">
            <span className="font-serif text-5xl font-black text-[#D92D20]/15 absolute top-4 right-4">03</span>
            <div className="w-12 h-12 rounded-2xl bg-[#D92D20]/10 text-[#D92D20] flex items-center justify-center mb-4 mx-auto">
              <ChefHat className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-[#38251F] text-lg mb-2">450°C Stone Oven Bake</h4>
            <p className="text-xs text-[#765747] leading-relaxed">
              Our chefs fire your pizza over stone deck ovens until the crust is blistered and golden.
            </p>
          </div>

          <div className="relative p-7 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] shadow-warm-sm">
            <span className="font-serif text-5xl font-black text-[#198754]/15 absolute top-4 right-4">04</span>
            <div className="w-12 h-12 rounded-2xl bg-[#198754]/10 text-[#198754] flex items-center justify-center mb-4 mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-[#38251F] text-lg mb-2">Live Status Tracking</h4>
            <p className="text-xs text-[#765747] leading-relaxed">
              Track kitchen preparation and delivery in real time with live polling order updates.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
