import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Flame,
  Check,
  AlertCircle,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  Info,
  ShieldCheck,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { PizzaVisualizer } from '../components/PizzaVisualizer.js';
import { Ingredient, Pizza } from '../types/index.js';
import { api } from '../api/client.js';
import { useCart } from '../context/CartContext.js';
import { useToast } from '../context/ToastContext.js';

export const CustomPizzaBuilderPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { showToast } = useToast();

  const presetPizza = (location.state as any)?.presetPizza as Pizza | undefined;

  // Raw ingredients loaded from backend
  const [bases, setBases] = useState<Ingredient[]>([]);
  const [sauces, setSauces] = useState<Ingredient[]>([]);
  const [cheeses, setCheeses] = useState<Ingredient[]>([]);
  const [veggies, setVeggies] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User selections
  const [selectedBaseId, setSelectedBaseId] = useState<string>('');
  const [selectedSauceId, setSelectedSauceId] = useState<string>('');
  const [selectedCheeseId, setSelectedCheeseId] = useState<string>('');
  const [selectedVeggieIds, setSelectedVeggieIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [customName, setCustomName] = useState<string>('My Custom Artisan Pizza');

  // Server-verified price state
  const [serverUnitPrice, setServerUnitPrice] = useState<number>(199);
  const [serverPriceBreakdown, setServerPriceBreakdown] = useState<any>(null);
  const [priceCalculating, setPriceCalculating] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<'base' | 'sauce' | 'cheese' | 'veggie'>('base');

  // 1. Fetch available ingredients on mount
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        setLoading(true);
        const res = await api.get('/builder/ingredients');
        if (res.success && res.data) {
          setBases(res.data.bases || []);
          setSauces(res.data.sauces || []);
          setCheeses(res.data.cheeses || []);
          setVeggies(res.data.veggies || []);

          if (presetPizza) {
            setCustomName(`Customized ${presetPizza.name}`);
            setSelectedBaseId(presetPizza.defaultBase?._id || res.data.bases[0]?._id);
            setSelectedSauceId(presetPizza.defaultSauce?._id || res.data.sauces[0]?._id);
            setSelectedCheeseId(presetPizza.defaultCheese?._id || res.data.cheeses[0]?._id);
            setSelectedVeggieIds((presetPizza.defaultVeggies || []).map((v) => v._id));
          } else {
            if (res.data.bases.length > 0) setSelectedBaseId(res.data.bases[0]._id);
            if (res.data.sauces.length > 0) setSelectedSauceId(res.data.sauces[0]._id);
            if (res.data.cheeses.length > 0) setSelectedCheeseId(res.data.cheeses[0]._id);
            if (res.data.veggies.length >= 2) {
              setSelectedVeggieIds([res.data.veggies[0]._id, res.data.veggies[1]._id]);
            }
          }
        }
      } catch (err) {
        setError((err as Error).message || 'Failed to load custom pizza builder ingredients');
      } finally {
        setLoading(false);
      }
    };

    fetchIngredients();
  }, [presetPizza]);

  // 2. Authoritative server-side price calculation
  useEffect(() => {
    if (!selectedBaseId || !selectedSauceId || !selectedCheeseId) return;

    let isSubscribed = true;
    const calculateServerPrice = async () => {
      try {
        setPriceCalculating(true);
        const res = await api.post('/builder/calculate-price', {
          baseId: selectedBaseId,
          sauceId: selectedSauceId,
          cheeseId: selectedCheeseId,
          veggieIds: selectedVeggieIds,
        });

        if (isSubscribed && res.success && res.data) {
          setServerUnitPrice(res.data.unitPrice);
          setServerPriceBreakdown(res.data.breakdown);
        }
      } catch (err) {
        console.error('Server pricing error:', err);
      } finally {
        if (isSubscribed) setPriceCalculating(false);
      }
    };

    const debounceTimer = setTimeout(calculateServerPrice, 150);
    return () => {
      isSubscribed = false;
      clearTimeout(debounceTimer);
    };
  }, [selectedBaseId, selectedSauceId, selectedCheeseId, selectedVeggieIds]);

  // Selected object maps
  const selectedBase = useMemo(() => bases.find((b) => b._id === selectedBaseId), [bases, selectedBaseId]);
  const selectedSauce = useMemo(() => sauces.find((s) => s._id === selectedSauceId), [sauces, selectedSauceId]);
  const selectedCheese = useMemo(() => cheeses.find((c) => c._id === selectedCheeseId), [cheeses, selectedCheeseId]);
  const selectedVeggies = useMemo(
    () => veggies.filter((v) => selectedVeggieIds.includes(v._id)),
    [veggies, selectedVeggieIds]
  );

  const toggleVeggie = (veggieId: string) => {
    setSelectedVeggieIds((prev) =>
      prev.includes(veggieId) ? prev.filter((id) => id !== veggieId) : [...prev, veggieId]
    );
  };

  const handleAddToCart = () => {
    if (!selectedBase || !selectedSauce || !selectedCheese) {
      showToast('Please select a base, sauce, and cheese before adding to cart', 'warning');
      return;
    }

    addItem(
      {
        type: 'custom',
        name: customName.trim() || 'Custom Artisan Pizza',
        base: {
          id: selectedBase._id,
          name: selectedBase.name,
          price: selectedBase.priceModifier || 0,
        },
        sauce: {
          id: selectedSauce._id,
          name: selectedSauce.name,
          price: selectedSauce.priceModifier || 0,
        },
        cheese: {
          id: selectedCheese._id,
          name: selectedCheese.name,
          price: selectedCheese.priceModifier || 0,
        },
        veggies: selectedVeggies.map((v) => ({
          id: v._id,
          name: v.name,
          price: v.priceModifier || 0,
        })),
        unitPrice: serverUnitPrice,
        quantity,
      },
      true // Opens Express Cart Drawer immediately
    );

    showToast(`Added "${customName}" to cart! 🍕`, 'success');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 border-4 border-[#D92D20] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-serif text-lg font-bold text-[#38251F]">
          Loading Artisan Wood-Stone Studio Ingredients...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-6 rounded-3xl bg-[#FDF2F2] border border-[#D92D20]/30 text-[#D92D20] space-y-2">
          <AlertCircle className="w-8 h-8 mx-auto" />
          <p className="font-bold text-base">{error}</p>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 'base', label: '1. Crust Base', count: bases.length, active: activeStep === 'base', icon: '🌾' },
    { id: 'sauce', label: '2. Simmered Sauce', count: sauces.length, active: activeStep === 'sauce', icon: '🍅' },
    { id: 'cheese', label: '3. Artisan Cheese', count: cheeses.length, active: activeStep === 'cheese', icon: '🧀' },
    { id: 'veggie', label: '4. Farm Veggies', count: selectedVeggieIds.length, active: activeStep === 'veggie', icon: '🌿' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-32">
      {/* 1. Studio Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#F2E8DC]">
        <div>
          <span className="text-[11px] font-extrabold text-[#D92D20] uppercase tracking-widest inline-flex items-center gap-1.5 bg-[#D92D20]/10 px-3 py-1 rounded-full border border-[#D92D20]/20">
            <Flame className="w-3.5 h-3.5" />
            450°C Stone Oven Culinary Lab
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-[#38251F] mt-1.5">
            Artisan Pizza Studio
          </h1>
          <p className="text-xs sm:text-sm text-[#765747]">
            Build your custom wood-fired pizza with authoritative real-time server pricing and live topping visualizer.
          </p>
        </div>

        {/* Custom Pizza Name Input */}
        <div className="w-full md:w-80">
          <label className="block text-[11px] font-bold text-[#765747] uppercase tracking-wider mb-1">
            Pizza Name
          </label>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-[#FFFCF7] border border-[#F2E8DC] text-xs font-bold text-[#38251F] focus:outline-none focus:border-[#D92D20] shadow-warm-sm"
            placeholder="My Custom Pizza"
          />
        </div>
      </div>

      {/* 2. Main Studio Grid: Left Visualizer, Right Step-by-Step Dials */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Visualizer & Snapshot Summary */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-36">
          <div className="bg-[#FFFCF7] rounded-3xl border border-[#F2E8DC] p-6 shadow-warm-md flex flex-col items-center text-center space-y-4">
            <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">
              <PizzaVisualizer
                baseName={selectedBase?.name}
                sauceName={selectedSauce?.name}
                cheeseName={selectedCheese?.name}
                veggieNames={selectedVeggies.map((v) => v.name)}
              />
            </div>

            {/* Live Assembly Recipe Summary */}
            <div className="w-full p-4 rounded-2xl bg-[#FFF8EF] border border-[#F2E8DC] text-left space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-[#38251F] border-b border-[#F2E8DC] pb-1.5">
                <span>Selected Ingredients</span>
                <span className="text-[#D97706] font-mono">
                  {priceCalculating ? 'Updating...' : `₹${serverUnitPrice}`}
                </span>
              </div>
              <p className="text-[11px] text-[#765747]">
                <strong>Crust:</strong> {selectedBase?.name} {selectedBase?.priceModifier ? `(+₹${selectedBase.priceModifier})` : '(Included)'}
              </p>
              <p className="text-[11px] text-[#765747]">
                <strong>Sauce:</strong> {selectedSauce?.name} {selectedSauce?.priceModifier ? `(+₹${selectedSauce.priceModifier})` : '(Included)'}
              </p>
              <p className="text-[11px] text-[#765747]">
                <strong>Cheese:</strong> {selectedCheese?.name} (+₹{selectedCheese?.priceModifier || 0})
              </p>
              <p className="text-[11px] text-[#765747]">
                <strong>Toppings ({selectedVeggies.length}):</strong>{' '}
                {selectedVeggies.length > 0
                  ? selectedVeggies.map((v) => v.name).join(', ')
                  : 'None selected'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Step-by-Step Dials (KFC/Domino's Style) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-[#FFFCF7] border border-[#F2E8DC] shadow-warm-sm">
            {steps.map((st) => (
              <button
                key={st.id}
                onClick={() => setActiveStep(st.id as any)}
                className={`p-3 rounded-xl text-left transition-all flex flex-col justify-between ${
                  st.active
                    ? 'bg-[#D92D20] text-white shadow-glow-red scale-[1.02]'
                    : 'bg-[#FFF8EF] hover:bg-[#F2E8DC]/50 text-[#765747]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">{st.icon}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                    st.active ? 'bg-white/20 text-white' : 'bg-[#E6D9C8] text-[#38251F]'
                  }`}>
                    {st.count}
                  </span>
                </div>
                <span className="text-xs font-black mt-2 leading-tight">{st.label}</span>
              </button>
            ))}
          </div>

          {/* Active Step Panel Content */}
          <div className="bg-[#FFFCF7] rounded-3xl border border-[#F2E8DC] p-6 shadow-warm-sm space-y-4">
            {activeStep === 'base' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-black text-[#38251F]">Step 1: Choose Your Crust Base</h3>
                    <p className="text-xs text-[#765747]">Fermented 48 hours for light, airy artisanal digestion.</p>
                  </div>
                  <span className="text-xs font-bold text-[#D97706] bg-[#FEF3C7] px-2.5 py-1 rounded-full">
                    Required (Pick 1)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {bases.map((base) => {
                    const isSelected = selectedBaseId === base._id;
                    return (
                      <div
                        key={base._id}
                        onClick={() => setSelectedBaseId(base._id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#FFF8EF] border-[#D92D20] shadow-warm-md'
                            : 'bg-[#FFF8EF]/50 border-[#F2E8DC] hover:border-[#D92D20]/40'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-serif font-bold text-sm text-[#38251F]">{base.name}</p>
                            <p className="text-xs text-[#765747] mt-0.5 line-clamp-2">{base.description}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-[#D92D20] bg-[#D92D20]' : 'border-[#F2E8DC]'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                        <div className="pt-2 mt-2 border-t border-[#F2E8DC]/60 flex items-center justify-between text-xs font-bold">
                          <span className="text-[#D97706]">
                            {base.priceModifier === 0 ? 'Standard Included' : `+₹${base.priceModifier}`}
                          </span>
                          <span className="text-[10px] text-[#198754]">In Stock</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeStep === 'sauce' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-black text-[#38251F]">Step 2: Choose Your Simmered Sauce</h3>
                    <p className="text-xs text-[#765747]">Slow-cooked in olive oil with Italian herbs.</p>
                  </div>
                  <span className="text-xs font-bold text-[#D97706] bg-[#FEF3C7] px-2.5 py-1 rounded-full">
                    Required (Pick 1)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sauces.map((sauce) => {
                    const isSelected = selectedSauceId === sauce._id;
                    return (
                      <div
                        key={sauce._id}
                        onClick={() => setSelectedSauceId(sauce._id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#FFF8EF] border-[#D92D20] shadow-warm-md'
                            : 'bg-[#FFF8EF]/50 border-[#F2E8DC] hover:border-[#D92D20]/40'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-serif font-bold text-sm text-[#38251F]">{sauce.name}</p>
                            <p className="text-xs text-[#765747] mt-0.5 line-clamp-2">{sauce.description}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-[#D92D20] bg-[#D92D20]' : 'border-[#F2E8DC]'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                        <div className="pt-2 mt-2 border-t border-[#F2E8DC]/60 flex items-center justify-between text-xs font-bold">
                          <span className="text-[#D97706]">
                            {sauce.priceModifier === 0 ? 'Standard Included' : `+₹${sauce.priceModifier}`}
                          </span>
                          <span className="text-[10px] text-[#198754]">In Stock</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeStep === 'cheese' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-black text-[#38251F]">Step 3: Choose Your Artisan Cheese</h3>
                    <p className="text-xs text-[#765747]">100% natural, fresh whole milk and plant-based cheeses.</p>
                  </div>
                  <span className="text-xs font-bold text-[#D97706] bg-[#FEF3C7] px-2.5 py-1 rounded-full">
                    Required (Pick 1)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cheeses.map((cheese) => {
                    const isSelected = selectedCheeseId === cheese._id;
                    return (
                      <div
                        key={cheese._id}
                        onClick={() => setSelectedCheeseId(cheese._id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#FFF8EF] border-[#D92D20] shadow-warm-md'
                            : 'bg-[#FFF8EF]/50 border-[#F2E8DC] hover:border-[#D92D20]/40'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-serif font-bold text-sm text-[#38251F]">{cheese.name}</p>
                            <p className="text-xs text-[#765747] mt-0.5 line-clamp-2">{cheese.description}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-[#D92D20] bg-[#D92D20]' : 'border-[#F2E8DC]'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                        <div className="pt-2 mt-2 border-t border-[#F2E8DC]/60 flex items-center justify-between text-xs font-bold">
                          <span className="text-[#D97706]">+₹{cheese.priceModifier}</span>
                          <span className="text-[10px] text-[#198754]">In Stock</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeStep === 'veggie' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-black text-[#38251F]">Step 4: Load Fresh Farm Toppings</h3>
                    <p className="text-xs text-[#765747]">Pick as many farm-fresh veggies and proteins as you like!</p>
                  </div>
                  <span className="text-xs font-bold text-[#198754] bg-[#EBF7EE] px-2.5 py-1 rounded-full">
                    {selectedVeggieIds.length} Selected
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {veggies.map((veg) => {
                    const isSelected = selectedVeggieIds.includes(veg._id);
                    return (
                      <div
                        key={veg._id}
                        onClick={() => toggleVeggie(veg._id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#FFF8EF] border-[#D92D20] shadow-sm'
                            : 'bg-[#FFF8EF]/50 border-[#F2E8DC] hover:border-[#D92D20]/40'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <p className="font-serif font-bold text-xs text-[#38251F]">{veg.name}</p>
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-[#D92D20] bg-[#D92D20]' : 'border-[#F2E8DC]'
                          }`}>
                            {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                        </div>
                        <div className="pt-1.5 mt-1.5 border-t border-[#F2E8DC]/60 text-[11px] font-bold text-[#D97706]">
                          +₹{veg.priceModifier}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Fixed Sticky Bottom Pricing & Add Bar (KFC/Domino's Style) */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#FFFCF7]/95 backdrop-blur-xl border-t border-[#F2E8DC] shadow-2xl p-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            {/* Quantity Stepper */}
            <div className="flex items-center border border-[#F2E8DC] rounded-xl bg-[#FFF8EF] overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2 text-[#765747] hover:text-[#D92D20] transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-3 text-sm font-black text-[#38251F] tabular-nums">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="p-2 text-[#765747] hover:text-[#D92D20] transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-serif font-black text-2xl text-[#D92D20]">
                  ₹{serverUnitPrice * quantity}
                </span>
                <span className="text-xs text-[#765747]">
                  (₹{serverUnitPrice} each)
                </span>
              </div>
              <span className="text-[10px] text-[#198754] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Server-Verified Authoritative Pricing
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 sm:flex-initial py-3 px-8 rounded-2xl bg-[#D92D20] hover:bg-[#A91F18] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-glow-red hover:scale-105 active:scale-95 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add Custom Pizza to Cart</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
