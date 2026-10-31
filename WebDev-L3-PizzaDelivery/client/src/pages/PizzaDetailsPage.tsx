import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Flame,
  Clock,
  Sparkles,
  ShoppingBag,
  Sliders,
  Check,
  Star,
  ShieldCheck,
  Award,
  ChevronRight,
  Plus,
  Minus,
} from 'lucide-react';
import { Pizza } from '../types/index.js';
import { api } from '../api/client.js';
import { useCart } from '../context/CartContext.js';
import { useToast } from '../context/ToastContext.js';
import { PizzaDetailsSkeleton } from '../components/SkeletonLoader.js';

export const PizzaDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { showToast } = useToast();

  const [pizza, setPizza] = useState<Pizza | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    const fetchPizza = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await api.get(`/pizzas/${id}`);
        if (res.success && res.data) {
          setPizza(res.data);
        } else {
          setError('Pizza recipe not found.');
        }
      } catch (err) {
        setError((err as Error).message || 'Failed to load pizza details');
      } finally {
        setLoading(false);
      }
    };

    fetchPizza();
  }, [id]);

  if (loading) {
    return <PizzaDetailsSkeleton />;
  }

  if (error || !pizza) {
    return (
      <div className="max-w-2xl mx-auto my-20 p-8 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] text-center space-y-4 shadow-warm-md">
        <div className="w-16 h-16 rounded-full bg-[#D92D20]/10 text-[#D92D20] flex items-center justify-center mx-auto text-2xl">
          🍕
        </div>
        <h2 className="font-serif text-3xl font-black text-[#38251F]">Recipe Not Found</h2>
        <p className="text-sm text-[#765747]">{error || 'Unable to locate this pizza item.'}</p>
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#D92D20] text-white text-sm font-bold shadow-glow-red"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Craft Menu
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      type: 'preset',
      pizzaId: pizza._id,
      name: pizza.name,
      base: {
        id: pizza.defaultBase._id,
        name: pizza.defaultBase.name,
        price: pizza.defaultBase.priceModifier || 0,
      },
      sauce: {
        id: pizza.defaultSauce._id,
        name: pizza.defaultSauce.name,
        price: pizza.defaultSauce.priceModifier || 0,
      },
      cheese: {
        id: pizza.defaultCheese._id,
        name: pizza.defaultCheese.name,
        price: pizza.defaultCheese.priceModifier || 0,
      },
      veggies: (pizza.defaultVeggies || []).map((v) => ({
        id: v._id,
        name: v.name,
        price: v.priceModifier || 0,
      })),
      unitPrice: pizza.basePrice,
      quantity,
    });

    showToast(`Added ${quantity}x "${pizza.name}" to cart! 🍕`, 'success');
  };

  const handleCustomize = () => {
    navigate('/builder', {
      state: {
        presetPizza: pizza,
      },
    });
  };

  const totalPrice = pizza.basePrice * quantity;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-[#765747]">
        <Link to="/" className="hover:text-[#D92D20]">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#F2E8DC]" />
        <Link to="/menu" className="hover:text-[#D92D20]">
          Craft Menu
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#F2E8DC]" />
        <span className="text-[#38251F] font-bold">{pizza.name}</span>
      </div>

      {/* Main Two-Column Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Product Photography Showcase */}
        <div className="lg:col-span-6 space-y-6">
          <div className="relative rounded-3xl overflow-hidden shadow-warm-lg border border-[#F2E8DC] bg-[#FFFCF7] aspect-[4/3]">
            <img
              src={pizza.imageUrl}
              alt={pizza.name}
              className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700"
            />
            {/* Top Badges */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {pizza.tags?.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#FFFCF7]/95 backdrop-blur-md text-[#38251F] border border-[#F2E8DC] shadow-sm flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                  {t}
                </span>
              ))}
            </div>

            {/* Veg Badge */}
            <div className="absolute top-4 right-4 bg-[#FFFCF7]/95 backdrop-blur-md p-2 rounded-xl border border-[#F2E8DC] shadow-sm">
              <div className="w-4 h-4 border-2 border-[#198754] flex items-center justify-center p-0.5 rounded-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-[#198754]"></div>
              </div>
            </div>

            {/* Bottom Wood-Stone Oven pill */}
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#D97706]" />
              Baked at 450°C in Stone Hearth
            </div>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#FFFCF7] border border-[#F2E8DC] text-center shadow-warm-sm">
              <Clock className="w-5 h-5 text-[#D97706] mx-auto mb-1" />
              <span className="text-xs font-bold text-[#38251F] block">30 Mins</span>
              <span className="text-[10px] text-[#765747]">Fast Hot Delivery</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FFFCF7] border border-[#F2E8DC] text-center shadow-warm-sm">
              <Award className="w-5 h-5 text-[#D92D20] mx-auto mb-1" />
              <span className="text-xs font-bold text-[#38251F] block">48-Hr Ferment</span>
              <span className="text-[10px] text-[#765747]">Airy Digestible Crust</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FFFCF7] border border-[#F2E8DC] text-center shadow-warm-sm">
              <ShieldCheck className="w-5 h-5 text-[#198754] mx-auto mb-1" />
              <span className="text-xs font-bold text-[#38251F] block">100% Mozzarella</span>
              <span className="text-[10px] text-[#765747]">Zero Analog Cheese</span>
            </div>
          </div>
        </div>

        {/* Right Column: Recipe Specifications & Purchase Controls */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#D92D20] uppercase tracking-wider">
              <Flame className="w-4 h-4 text-[#D97706]" />
              Artisan Wood-Fired Recipe
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-black text-[#38251F] leading-tight">
              {pizza.name}
            </h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs font-bold text-[#765747]">4.9 (148 Customer Reviews)</span>
            </div>
          </div>

          <p className="text-base text-[#765747] leading-relaxed font-normal">
            {pizza.description}
          </p>

          {/* Recipe Blueprint Breakdown */}
          <div className="p-6 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] shadow-warm-sm space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#38251F] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D97706]" />
              Curated Recipe Ingredients
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#FFF8EF] border border-[#F2E8DC]">
                <span className="text-[10px] uppercase font-bold text-[#765747] block">Base Dough</span>
                <span className="font-bold text-[#38251F] text-sm">{pizza.defaultBase?.name}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FFF8EF] border border-[#F2E8DC]">
                <span className="text-[10px] uppercase font-bold text-[#765747] block">Handcrafted Sauce</span>
                <span className="font-bold text-[#38251F] text-sm">{pizza.defaultSauce?.name}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FFF8EF] border border-[#F2E8DC]">
                <span className="text-[10px] uppercase font-bold text-[#765747] block">Artisanal Cheese</span>
                <span className="font-bold text-[#38251F] text-sm">{pizza.defaultCheese?.name}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FFF8EF] border border-[#F2E8DC]">
                <span className="text-[10px] uppercase font-bold text-[#765747] block">Toppings & Veggies</span>
                <span className="font-bold text-[#38251F] text-sm">
                  {pizza.defaultVeggies?.map((v) => v.name).join(', ') || 'Chef Selected Garnish'}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing & Add to Cart Action Area */}
          <div className="p-6 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] shadow-warm-md space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#765747] font-bold block">
                  Total Price
                </span>
                <span className="font-serif text-4xl font-black text-[#38251F]">
                  ₹{totalPrice}
                </span>
                {quantity > 1 && (
                  <span className="text-xs text-[#765747] ml-2 font-medium">
                    (₹{pizza.basePrice} each)
                  </span>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-3 bg-[#FFF8EF] border border-[#F2E8DC] rounded-2xl p-1.5 shadow-sm">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-xl bg-[#FFFCF7] hover:bg-[#F2E8DC] text-[#38251F] flex items-center justify-center transition-colors shadow-sm"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-serif text-lg font-bold text-[#38251F]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-9 h-9 rounded-xl bg-[#FFFCF7] hover:bg-[#F2E8DC] text-[#38251F] flex items-center justify-center transition-colors shadow-sm"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-4 px-6 rounded-2xl bg-[#D92D20] hover:bg-[#A91F18] text-white font-bold text-base shadow-glow-red flex items-center justify-center gap-2.5 transition-all active:scale-95"
              >
                <ShoppingBag className="w-5 h-5" />
                Add to Cart • ₹{totalPrice}
              </button>

              <button
                onClick={handleCustomize}
                className="py-4 px-6 rounded-2xl border border-[#F2E8DC] bg-[#FFF8EF] hover:bg-[#F2E8DC] text-[#38251F] font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Sliders className="w-4 h-4 text-[#D97706]" />
                Customize in Builder
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

