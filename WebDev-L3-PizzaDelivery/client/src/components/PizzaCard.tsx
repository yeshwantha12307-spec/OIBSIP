import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Sliders, Sparkles } from 'lucide-react';
import { Pizza } from '../types/index.js';
import { useCart } from '../context/CartContext.js';
import { useToast } from '../context/ToastContext.js';

interface PizzaCardProps {
  pizza: Pizza;
}

export const PizzaCard: React.FC<PizzaCardProps> = ({ pizza }) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { showToast } = useToast();

  const handleQuickAdd = () => {
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
      quantity: 1,
    });

    showToast(`Added "${pizza.name}" to cart! 🍕`, 'success');
  };

  const handleCustomize = () => {
    navigate('/builder', {
      state: {
        presetPizza: pizza,
      },
    });
  };

  return (
    <div className="group relative bg-oasis-card border border-oasis-border/60 hover:border-oasis-red/40 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-glow-red hover:-translate-y-1 flex flex-col justify-between">
      {/* Image Container with Badges */}
      <div className="relative h-56 overflow-hidden bg-slate-900">
        <img
          src={pizza.imageUrl}
          alt={pizza.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-oasis-card via-transparent to-black/30"></div>

        {/* Dietary Tag & Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {pizza.tags?.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-black/60 backdrop-blur-md text-oasis-gold border border-oasis-gold/30 flex items-center gap-1 shadow-sm"
            >
              <Sparkles className="w-3 h-3 text-oasis-gold" />
              {tag}
            </span>
          ))}
        </div>

        {/* Veg Badge indicator */}
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md p-1.5 rounded-lg border border-white/10">
          <div className="w-4 h-4 border-2 border-emerald-500 flex items-center justify-center p-0.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          </div>
        </div>
      </div>

      {/* Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-serif text-xl font-bold text-white group-hover:text-oasis-red transition-colors mb-2">
            {pizza.name}
          </h3>
          <p className="text-sm text-oasis-muted line-clamp-2 leading-relaxed mb-4">
            {pizza.description}
          </p>

          {/* Included Ingredients Preview */}
          <div className="text-xs text-slate-400 bg-oasis-dark/60 rounded-xl p-3 border border-white/5 mb-5 space-y-1">
            <p>
              <span className="text-oasis-amber font-medium">Crust:</span> {pizza.defaultBase?.name || 'Hand Tossed'}
            </p>
            <p>
              <span className="text-oasis-amber font-medium">Sauce & Cheese:</span> {pizza.defaultSauce?.name || 'Marinara'}, {pizza.defaultCheese?.name || 'Mozzarella'}
            </p>
          </div>
        </div>

        {/* Price & Action Buttons */}
        <div className="pt-2 border-t border-oasis-border/60 flex items-center justify-between gap-3">
          <div>
            <span className="text-xs text-oasis-muted uppercase tracking-wider block">Price</span>
            <span className="text-2xl font-bold font-serif text-white">₹{pizza.basePrice}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCustomize}
              className="p-2.5 rounded-xl border border-oasis-border bg-oasis-dark/80 hover:bg-oasis-border text-oasis-light transition-colors hover:text-white"
              title="Customize this pizza"
              aria-label={`Customize ${pizza.name}`}
            >
              <Sliders className="w-4 h-4" />
            </button>
            <button
              onClick={handleQuickAdd}
              className="px-4 py-2.5 rounded-xl bg-oasis-red hover:bg-oasis-red-hover text-white font-medium text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
