import React, { useEffect, useState } from 'react';
import { Search, Sparkles, Filter, AlertCircle } from 'lucide-react';
import { PizzaCard } from '../components/PizzaCard.js';
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
    { id: 'SPICY', label: 'Spicy' },
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
        <span className="text-xs font-bold text-oasis-red uppercase tracking-widest inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Authentic Wood-Fired Menu
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-black text-white">
          Our Handcrafted Pizzas
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Crafted with imported Italian flours, authentic slow-simmered sauces, and premium cheeses. Pick a recipe as-is or customize it in our builder!
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-oasis-card border border-oasis-border">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeFilter === f.id
                  ? 'bg-oasis-red text-white shadow-md'
                  : 'bg-oasis-dark text-slate-300 hover:text-white hover:bg-white/5 border border-oasis-border/60'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-oasis-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pizza by name, sauce, topping..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-oasis-dark border border-oasis-border text-sm text-white placeholder-slate-500 focus:outline-none focus:border-oasis-red transition-colors"
          />
        </div>
      </div>

      {/* Pizzas Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-96 rounded-2xl bg-oasis-card animate-pulse border border-oasis-border/40"></div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 space-y-2">
          <AlertCircle className="w-8 h-8 mx-auto" />
          <p className="font-semibold">{error}</p>
          <p className="text-xs text-rose-300">Please make sure the backend server is running on port 5000.</p>
        </div>
      ) : filteredPizzas.length === 0 ? (
        <div className="text-center py-20 bg-oasis-card/50 rounded-2xl border border-oasis-border/40 space-y-3">
          <span className="text-5xl">🔍</span>
          <h3 className="font-serif text-xl font-bold text-white">No pizzas match your filter</h3>
          <p className="text-sm text-oasis-muted max-w-md mx-auto">
            Try adjusting your search keywords or switch to "All Craft Pizzas" to view our complete culinary selection.
          </p>
          <button
            onClick={() => {
              setActiveFilter('ALL');
              setSearch('');
            }}
            className="px-4 py-2 rounded-xl bg-oasis-dark border border-oasis-border text-sm text-white font-medium hover:bg-white/5 transition-colors"
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
