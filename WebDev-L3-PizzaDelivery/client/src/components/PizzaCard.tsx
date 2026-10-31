import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Sliders, Sparkles, Flame, Check, Plus, Tag } from 'lucide-react';
import { Pizza } from '../types/index.js';
import { useCart } from '../context/CartContext.js';
import { useToast } from '../context/ToastContext.js';

interface PizzaCardProps {
  pizza: Pizza;
}

export const PizzaCard: React.FC<PizzaCardProps> = ({ pizza }) => {
  const navigate = useNavigate();
  const { addItem, cart, updateQuantity } = useCart();
  const { showToast } = useToast();

  // Check if item is already in cart to display KFC/Domino's live quantity stepper
  const cartItem = cart.find((i) => i.pizzaId === pizza._id);
  const inCartQuantity = cartItem ? cartItem.quantity : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(
      {
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
        quantity: 1,
      },
      true // opens Express Cart Drawer immediately
    );

    showToast(`Added "${pizza.name}" to cart! 🍕`, 'success');
  };

  const handleCustomize = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/builder', {
      state: {
        presetPizza: pizza,
      },
    });
  };

  const isSpicy = pizza.tags?.some((t) => t.toLowerCase().includes('spicy'));
  const isChefSpecial = pizza.tags?.some((t) => t.toLowerCase().includes('chef'));
  const isBestseller = pizza.tags?.some((t) => t.toLowerCase().includes('bestseller'));

  return (
    <div
      onClick={() => navigate(`/pizza/${pizza._id}`)}
      className="group relative bg-[#FFFCF7] border border-[#F2E8DC] hover:border-[#D92D20]/50 rounded-3xl overflow-hidden shadow-warm-sm hover:shadow-warm-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between cursor-pointer"
    >
      {/* 1. Header Image Container */}
      <div className="relative h-64 overflow-hidden bg-[#F2E8DC]/40">
        <img
          src={pizza.imageUrl}
          alt={pizza.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

        {/* Top Badges (KFC/Domino's Style) */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
          {/* Veg/Non-Veg Icon Indicator */}
          <span
            className={`w-6 h-6 rounded-lg flex items-center justify-center p-0.5 shadow-md ${
              pizza.isVegetarian ? 'bg-white border-2 border-[#198754]' : 'bg-white border-2 border-[#D92D20]'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                pizza.isVegetarian ? 'bg-[#198754]' : 'bg-[#D92D20]'
              }`}
            />
          </span>

          {isChefSpecial && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#D92D20] text-white shadow-glow-red flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Chef Special
            </span>
          )}

          {isBestseller && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FEF3C7] text-[#D97706] shadow-sm">
              ⭐ Bestseller
            </span>
          )}

          {isSpicy && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FDF2F2] text-[#D92D20] border border-[#D92D20]/30 flex items-center gap-0.5">
              <Flame className="w-3 h-3 text-[#D92D20]" />
              Spicy
            </span>
          )}
        </div>

        {/* Fast Pricing Overlay */}
        <div className="absolute bottom-3 right-3">
          <span className="font-serif font-black text-xl text-white drop-shadow-md">
            ₹{pizza.basePrice}
          </span>
        </div>
      </div>

      {/* 2. Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="font-serif text-xl font-bold text-[#38251F] group-hover:text-[#D92D20] transition-colors leading-tight">
            {pizza.name}
          </h3>

          <p className="text-xs text-[#765747] leading-relaxed line-clamp-2">
            {pizza.description}
          </p>

          {/* Sourdough Crust & Sauce Preview Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] text-[#765747]">
            <span className="px-2 py-0.5 rounded-md bg-[#FFF8EF] border border-[#F2E8DC] font-medium">
              🌾 {pizza.defaultBase.name}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#FFF8EF] border border-[#F2E8DC] font-medium">
              🍅 {pizza.defaultSauce.name}
            </span>
          </div>
        </div>

        {/* 3. Action Buttons (KFC style Quick Add + Domino's Customize) */}
        <div className="pt-3 border-t border-[#F2E8DC] flex items-center gap-2">
          {/* Customize in Studio Button */}
          <button
            type="button"
            onClick={handleCustomize}
            className="flex-1 py-2.5 px-3 rounded-xl border border-[#F2E8DC] hover:border-[#D97706] bg-[#FFF8EF] hover:bg-[#FEF3C7]/40 text-[#765747] hover:text-[#D97706] text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            title="Tweak toppings and cheeses in Studio"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Customize</span>
          </button>

          {/* Quick Add or Live Stepper */}
          {inCartQuantity > 0 ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center border-2 border-[#D92D20] rounded-xl bg-[#FFF8EF] overflow-hidden shadow-sm"
            >
              <button
                type="button"
                onClick={() => updateQuantity(cartItem!.cartItemId, inCartQuantity - 1)}
                className="px-2.5 py-2 text-[#D92D20] font-black hover:bg-[#D92D20]/10 transition-colors"
              >
                -
              </button>
              <span className="px-2 text-xs font-black text-[#38251F] tabular-nums">
                {inCartQuantity}
              </span>
              <button
                type="button"
                onClick={() => updateQuantity(cartItem!.cartItemId, inCartQuantity + 1)}
                className="px-2.5 py-2 text-[#D92D20] font-black hover:bg-[#D92D20]/10 transition-colors"
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleQuickAdd}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#D92D20] hover:bg-[#A91F18] text-white text-xs font-bold transition-all shadow-glow-red hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
