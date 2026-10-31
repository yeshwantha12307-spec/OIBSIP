import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Sliders, Sparkles, Eye } from 'lucide-react';
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

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleCustomize = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/builder', {
      state: {
        presetPizza: pizza,
      },
    });
  };

  return (
    <div
      onClick={() => navigate(`/pizza/${pizza._id}`)}
      className="group relative bg-[#FFFCF7] border border-[#F2E8DC] hover:border-[#D92D20]/40 rounded-3xl overflow-hidden shadow-warm-sm transition-all duration-300 hover:shadow-warm-lg hover:-translate-y-1 flex flex-col justify-between cursor-pointer"
    >
      {/* Image Container with Badges */}
      <div className="relative h-60 overflow-hidden bg-[#F2E8DC]/40">
        <img
          src={pizza.imageUrl}
          alt={pizza.name}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10"></div>

        {/* Dietary Tag & Badges */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
          {pizza.tags?.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FFFCF7]/95 backdrop-blur-md text-[#38251F] border border-[#F2E8DC] flex items-center gap-1 shadow-sm"
            >
              <Sparkles className="w-3 h-3 text-[#D97706]" />
              {tag}
            </span>
          ))}
        </div>

        {/* Veg Badge indicator */}
        <div className="absolute top-3.5 right-3.5 bg-[#FFFCF7]/95 backdrop-blur-md p-1.5 rounded-xl border border-[#F2E8DC] shadow-sm">
          <div className="w-4 h-4 border-2 border-[#198754] flex items-center justify-center p-0.5 rounded-sm">
            <div className="w-2 h-2 rounded-full bg-[#198754]"></div>
          </div>
        </div>

        {/* Click to view details overlay button */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="px-3 py-1.5 rounded-xl bg-[#FFFCF7]/90 text-[#38251F] text-xs font-bold shadow-md flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#D92D20]" />
            View Details
          </span>
        </div>
      </div>

      {/* Content Details */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-serif text-xl font-bold text-[#38251F] group-hover:text-[#D92D20] transition-colors mb-2">
            {pizza.name}
          </h3>
          <p className="text-sm text-[#765747] line-clamp-2 leading-relaxed mb-4 font-normal">
            {pizza.description}
          </p>

          {/* Included Ingredients Preview */}
          <div className="text-xs text-[#765747] bg-[#FFF8EF] rounded-2xl p-3.5 border border-[#F2E8DC] mb-5 space-y-1.5">
            <p>
              <span className="text-[#38251F] font-bold">Crust:</span> {pizza.defaultBase?.name || 'Hand Tossed'}
            </p>
            <p>
              <span className="text-[#38251F] font-bold">Sauce & Cheese:</span> {pizza.defaultSauce?.name || 'Marinara'}, {pizza.defaultCheese?.name || 'Mozzarella'}
            </p>
          </div>
        </div>

        {/* Price & Action Buttons */}
        <div className="pt-3 border-t border-[#F2E8DC] flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-[#765747] uppercase tracking-wider block font-bold">Price</span>
            <span className="text-2xl font-black font-serif text-[#38251F]">₹{pizza.basePrice}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCustomize}
              className="p-2.5 rounded-xl border border-[#F2E8DC] bg-[#FFF8EF] hover:bg-[#F2E8DC] text-[#38251F] transition-colors shadow-sm"
              title="Customize in Pizza Studio"
              aria-label={`Customize ${pizza.name}`}
            >
              <Sliders className="w-4 h-4 text-[#765747]" />
            </button>
            <button
              onClick={handleQuickAdd}
              className="px-4 py-2.5 rounded-xl bg-[#D92D20] hover:bg-[#A91F18] text-white font-bold text-xs flex items-center gap-1.5 shadow-glow-red transition-all active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
