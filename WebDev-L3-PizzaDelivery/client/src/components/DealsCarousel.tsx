import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Sparkles, Plus, Check } from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useToast } from '../context/ToastContext.js';
import { Pizza } from '../types/index.js';

interface ComboDeal {
  id: string;
  badge: string;
  title: string;
  tagline: string;
  description: string;
  price: number;
  originalPrice: number;
  savings: number;
  pizzaName: string;
  imageUrl: string;
  tags: string[];
}

interface DealsCarouselProps {
  pizzas: Pizza[];
}

export const DealsCarousel: React.FC<DealsCarouselProps> = ({ pizzas }) => {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Map combos to real seeded pizzas
  const combos: ComboDeal[] = [
    {
      id: 'combo_hearth_box',
      badge: '🔥 HOT BUNDLE • SAVE 25%',
      title: 'Hearth Duo Feast Box',
      tagline: '2 Handcrafted Pizzas & Garlic Butter',
      description: 'Margherita Superiore + Truffle Cremini Melt, baked in our 450°C stone oven.',
      price: 649,
      originalPrice: 878,
      savings: 229,
      pizzaName: 'Margherita Superiore',
      imageUrl: pizzas.find((p) => p.name.includes('Margherita'))?.imageUrl || 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800&auto=format&fit=crop&q=80',
      tags: ['Chef Special', 'Italian Classic'],
    },
    {
      id: 'combo_fire_burst',
      badge: '⭐ SPICY BESTSELLER',
      title: 'Fiery Peri-Peri Party Combo',
      tagline: 'Double Cheese Burst Sensation',
      description: 'Fiery Peri-Peri Paneer with double mozzarella layer, roasted peppers, and dip.',
      price: 499,
      originalPrice: 579,
      savings: 80,
      pizzaName: 'Fiery Peri-Peri Paneer',
      imageUrl: pizzas.find((p) => p.name.includes('Peri-Peri'))?.imageUrl || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80',
      tags: ['Spicy', 'Cheese Burst'],
    },
    {
      id: 'combo_farm_fresh',
      badge: '🌿 PURE VEG SPECIAL',
      title: 'Rustic Garden Family Meal',
      tagline: 'Farm-Fresh Sourdough Feast',
      description: 'Rustic Farmhouse Garden + Verde Pesto Genovese with wild cremini mushrooms.',
      price: 689,
      originalPrice: 898,
      savings: 209,
      pizzaName: 'Rustic Farmhouse Garden',
      imageUrl: pizzas.find((p) => p.name.includes('Farmhouse'))?.imageUrl || 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&auto=format&fit=crop&q=80',
      tags: ['Garden Fresh', 'Family Favorite'],
    },
  ];

  const handleAddCombo = (combo: ComboDeal) => {
    // Find matching real pizza in catalog to ensure full DB compatibility
    const realPizza = pizzas.find((p) => p.name.toLowerCase() === combo.pizzaName.toLowerCase()) || pizzas[0];
    if (realPizza) {
      addItem({
        type: 'preset',
        pizzaId: realPizza._id,
        name: combo.title,
        base: {
          id: realPizza.defaultBase._id,
          name: realPizza.defaultBase.name,
          price: realPizza.defaultBase.priceModifier || 0,
        },
        sauce: {
          id: realPizza.defaultSauce._id,
          name: realPizza.defaultSauce.name,
          price: realPizza.defaultSauce.priceModifier || 0,
        },
        cheese: {
          id: realPizza.defaultCheese._id,
          name: realPizza.defaultCheese.name,
          price: realPizza.defaultCheese.priceModifier || 0,
        },
        veggies: (realPizza.defaultVeggies || []).map((v) => ({
          id: v._id,
          name: v.name,
          price: v.priceModifier || 0,
        })),
        unitPrice: combo.price,
        quantity: 1,
      });

      showToast(`Added combo "${combo.title}" to cart! 🍕`, 'success');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#D92D20] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Limited Wood-Stone Combos
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-black text-[#38251F]">
            Hot Deals & Bucket Boxes
          </h2>
        </div>
        <p className="text-xs text-[#765747]">
          KFC-style value bundles baked with authentic artisanal Neapolitan ingredients.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {combos.map((combo) => (
          <div
            key={combo.id}
            className="group relative bg-[#FFFCF7] rounded-3xl border border-[#F2E8DC] hover:border-[#D92D20]/40 overflow-hidden shadow-warm-sm hover:shadow-warm-lg transition-all duration-300 flex flex-col justify-between"
          >
            {/* Image & Ribbon Banner */}
            <div className="relative h-48 overflow-hidden bg-[#F2E8DC]/40">
              <img
                src={combo.imageUrl}
                alt={combo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Deal Badge */}
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#D92D20] text-white shadow-glow-red">
                  {combo.badge}
                </span>
              </div>

              {/* Savings Chip */}
              <div className="absolute bottom-3 right-3">
                <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-[#FEF3C7] text-[#D97706] shadow-sm flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  Save ₹{combo.savings}
                </span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#D97706]">
                  {combo.tagline}
                </p>
                <h3 className="font-serif text-lg font-black text-[#38251F] leading-tight">
                  {combo.title}
                </h3>
                <p className="text-xs text-[#765747] leading-relaxed line-clamp-2">
                  {combo.description}
                </p>
              </div>

              {/* Pricing & Add Action */}
              <div className="pt-3 border-t border-[#F2E8DC] flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-xl font-black text-[#D92D20]">
                      ₹{combo.price}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      ₹{combo.originalPrice}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#198754] font-bold">Inclusive of taxes</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddCombo(combo)}
                  className="px-4 py-2.5 rounded-xl bg-[#D92D20] hover:bg-[#A91F18] text-white text-xs font-bold flex items-center gap-1.5 shadow-glow-red hover:scale-105 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Deal</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

