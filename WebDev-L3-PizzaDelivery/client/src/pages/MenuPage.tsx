import React, { useEffect, useState, useRef } from 'react';
import { Search, Sparkles, Filter, AlertCircle, Flame, SlidersHorizontal, Tag } from 'lucide-react';
import { PizzaCard } from '../components/PizzaCard.js';
import { PizzaCardSkeleton } from '../components/SkeletonLoader.js';
import { DealsCarousel } from '../components/DealsCarousel.js';
import { Pizza } from '../types/index.js';
import { api } from '../api/client.js';

interface CategoryTab {
  id: string;
  label: string;
  icon: string;
}

export const MenuPage: React.FC = () => {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');

  const categories: CategoryTab[] = [
    { id: 'all', label: 'All Craft Pizzas', icon: '🍕' },
    { id: 'deals', label: 'Hot Deals & Bundles', icon: '🔥' },
    { id: 'bestseller', label: 'Chef Bestsellers', icon: '⭐' },
    { id: 'veg', label: 'Pure Vegetarian', icon: '🌿' },
    { id: 'spicy', label: 'Spicy Fire', icon: '🌶️' },
    { id: 'cheese_burst', label: 'Cheese Burst', icon: '🧀' },
  ];

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const res = await api.get('/pizzas');
        if (res.success && Array.isArray(res.data)) {
          setPizzas(res.data);
        } else {
          setError('Failed to load menu pizzas');
        }
      } catch (err) {
        setError((err as Error).message || 'Unable to connect to pizza menu service');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const filteredPizzas = pizzas.filter((pizza) => {
    const matchesSearch =
      pizza.name.toLowerCase().includes(search.toLowerCase()) ||
      pizza.description.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'all' || activeTab === 'deals') return true;
    if (activeTab === 'veg') return pizza.isVegetarian;
    if (activeTab === 'bestseller')
      return pizza.tags?.some((t) => t.toLowerCase().includes('chef') || t.toLowerCase().includes('bestseller'));
    if (activeTab === 'spicy') return pizza.tags?.some((t) => t.toLowerCase().includes('spicy'));
    if (activeTab === 'cheese_burst')
      return pizza.tags?.some((t) => t.toLowerCase().includes('burst') || pizza.name.toLowerCase().includes('peri-peri'));

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* 1. Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-2.5">
        <span className="text-[11px] font-extrabold text-[#D92D20] uppercase tracking-widest inline-flex items-center gap-1.5 bg-[#D92D20]/10 px-3 py-1 rounded-full border border-[#D92D20]/20">
          <Sparkles className="w-3.5 h-3.5" />
          450°C Wood-Fired Neapolitan Hearth
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-black text-[#38251F]">
          Our Craft Pizza Menu
        </h1>
        <p className="text-[#765747] text-xs sm:text-sm">
          Prepared with 48-hr slow-fermented dough, whole milk mozzarella, and San Marzano DOP tomatoes.
        </p>
      </div>

      {/* 2. KFC Style Hot Deals Carousel Section */}
      <DealsCarousel pizzas={pizzas} />

      {/* 3. Sticky Category ScrollSpy Bar */}
      <div className="sticky top-28 z-30 bg-[#FFF8EF]/95 backdrop-blur-md py-3 -mx-4 px-4 sm:mx-0 sm:px-0 border-y sm:border-y-0 sm:border-b border-[#F2E8DC] transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Scrollable Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const isActive = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#D92D20] text-white shadow-glow-red scale-105'
                      : 'bg-[#FFFCF7] text-[#765747] hover:text-[#38251F] border border-[#F2E8DC] hover:border-[#D92D20]/30 shadow-warm-sm'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#765747] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pizza, sauce, toppings..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#FFFCF7] border border-[#F2E8DC] text-xs text-[#38251F] placeholder-slate-400 focus:outline-none focus:border-[#D92D20] shadow-warm-sm transition-colors"
            />
          </div>
        </div>
      </div>

      {/* 4. Pizzas Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <PizzaCardSkeleton key={n} />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center rounded-3xl bg-[#FDF2F2] border border-[#D92D20]/30 text-[#D92D20] space-y-2">
          <AlertCircle className="w-8 h-8 mx-auto" />
          <p className="font-semibold text-sm">{error}</p>
          <p className="text-xs text-[#765747]">
            Please verify the backend server is running on port 5000.
          </p>
        </div>
      ) : filteredPizzas.length === 0 ? (
        <div className="text-center py-20 bg-[#FFFCF7] rounded-3xl border border-[#F2E8DC] space-y-3 shadow-warm-sm">
          <span className="text-5xl">🔍</span>
          <h3 className="font-serif text-xl font-bold text-[#38251F]">No craft pizzas match your filter</h3>
          <p className="text-xs text-[#765747] max-w-md mx-auto">
            Try adjusting your search keywords or reset to "All Craft Pizzas" to view our complete selection.
          </p>
          <button
            onClick={() => {
              setActiveTab('all');
              setSearch('');
            }}
            className="px-5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#F2E8DC] text-xs font-bold text-[#38251F] hover:bg-[#F2E8DC]/50 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPizzas.map((pizza) => (
            <PizzaCard key={pizza._id} pizza={pizza} />
          ))}
        </div>
      )}
    </div>
  );
};
