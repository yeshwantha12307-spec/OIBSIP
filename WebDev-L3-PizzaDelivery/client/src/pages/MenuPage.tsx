import React, { useEffect, useState } from 'react';
import { Search, Sparkles, Filter, AlertCircle, Flame } from 'lucide-react';
import { PizzaCard } from '../components/PizzaCard.js';
import { PizzaCardSkeleton } from '../components/SkeletonLoader.js';
import { Pizza } from '../types/index.js';
import { api } from '../api/client.js';

export const MenuPage: React.FC = () => {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

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

  const filters = [
    { id: 'ALL', label: 'All Craft Pizzas' },
    { id: 'VEG', label: 'Vegetarian' },
    { id: 'CHEF', label: 'Chef Specials' },
    { id: 'SPICY', label: 'Spicy Fire' },
    { id: 'BURST', label: 'Cheese Burst' },
  ];

  const filteredPizzas = pizzas.filter((pizza) => {
    const matchesSearch =
      pizza.name.toLowerCase().includes(search.toLowerCase()) ||
      pizza.description.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'VEG') return pizza.isVegetarian;
    if (activeFilter === 'CHEF') return pizza.tags?.some((t) => t.toLowerCase().includes('chef'));
    if (activeFilter === 'SPICY') return pizza.tags?.some((t) => t.toLowerCase().includes('spicy'));
    if (activeFilter === 'BURST') return pizza.tags?.some((t) => t.toLowerCase().includes('burst'));

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-[#D92D20] uppercase tracking-widest inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#D92D20]/10 border border-[#D92D20]/25 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
          Authentic Wood-Fired Menu
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-black text-[#38251F]">
          Our Handcrafted Pizzas
        </h1>
        <p className="text-[#765747] text-sm sm:text-base leading-relaxed">
          Crafted with imported Italian flours, authentic slow-simmered sauces, and premium cheeses. Pick a recipe as-is or customize it in our pizza builder!
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] shadow-warm-sm">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                activeFilter === f.id
                  ? 'bg-[#D92D20] text-white shadow-glow-red'
                  : 'bg-[#FFF8EF] text-[#765747] hover:text-[#38251F] hover:bg-[#F2E8DC] border border-[#F2E8DC]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#765747] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pizza by name, sauce, topping..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#F2E8DC] bg-[#FFF8EF] text-[#38251F] text-xs placeholder:text-[#765747] focus:outline-none focus:border-[#D92D20] transition-colors shadow-inner"
          />
        </div>
      </div>

      {/* Product Grid Area */}
      {error && (
        <div className="p-6 rounded-3xl bg-[#FDF2F2] border border-[#D92D20]/30 text-[#D92D20] text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <PizzaCardSkeleton key={n} />
          ))}
        </div>
      ) : filteredPizzas.length === 0 ? (
        <div className="text-center py-20 bg-[#FFFCF7] rounded-3xl border border-[#F2E8DC] p-8 space-y-4 shadow-warm-sm">
          <div className="w-16 h-16 rounded-full bg-[#FFF8EF] border border-[#F2E8DC] flex items-center justify-center mx-auto text-3xl">
            🔍
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#38251F]">No Pizzas Matched</h3>
          <p className="text-sm text-[#765747] max-w-sm mx-auto">
            Try adjusting your search query or dietary filter to view other artisan recipes.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setActiveFilter('ALL');
            }}
            className="px-6 py-2.5 rounded-2xl bg-[#D92D20] text-white text-xs font-bold shadow-glow-red"
          >
            Clear Filters
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
