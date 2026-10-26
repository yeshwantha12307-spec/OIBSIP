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

          // Set defaults or use preset pizza passed from state
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
            // Default 2 veggies
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

  // 2. Query server-side price preview whenever selections change
  useEffect(() => {
    if (!selectedBaseId || !selectedSauceId || !selectedCheeseId) return;

    const queryServerPrice = async () => {
      setPriceCalculating(true);
      try {
        const res = await api.post('/builder/preview-price', {
          baseId: selectedBaseId,
          sauceId: selectedSauceId,
          cheeseId: selectedCheeseId,
          veggieIds: selectedVeggieIds,
        });

        if (res.success && res.data) {
          setServerUnitPrice(res.data.unitPrice);
          setServerPriceBreakdown(res.data.breakdown);
        }
      } catch (err) {
        console.error('Failed to calculate server price:', err);
      } finally {
        setPriceCalculating(false);
      }
    };

    const timer = setTimeout(queryServerPrice, 150);
    return () => clearTimeout(timer);
  }, [selectedBaseId, selectedSauceId, selectedCheeseId, selectedVeggieIds]);

  // Lookups for visualizer
  const currentBase = useMemo(() => bases.find((b) => b._id === selectedBaseId), [bases, selectedBaseId]);
  const currentSauce = useMemo(() => sauces.find((s) => s._id === selectedSauceId), [sauces, selectedSauceId]);
  const currentCheese = useMemo(() => cheeses.find((c) => c._id === selectedCheeseId), [cheeses, selectedCheeseId]);
  const currentVeggieNames = useMemo(
    () => veggies.filter((v) => selectedVeggieIds.includes(v._id)).map((v) => v.name),
    [veggies, selectedVeggieIds]
  );

  const toggleVeggie = (veggieId: string, isAvailable: boolean) => {
    if (!isAvailable) return;
    setSelectedVeggieIds((prev) =>
      prev.includes(veggieId) ? prev.filter((id) => id !== veggieId) : [...prev, veggieId]
    );
  };

  const handleAddToCart = () => {
    if (!currentBase || !currentSauce || !currentCheese) {
      showToast('Please select a base, sauce, and cheese before adding to cart', 'error');
      return;
    }

    const selectedVeggieItems = veggies.filter((v) => selectedVeggieIds.includes(v._id));

    addItem({
      type: 'custom',
      name: customName.trim() || 'Custom Artisan Pizza',
      base: {
        id: currentBase._id,
        name: currentBase.name,
        price: currentBase.priceModifier || 0,
      },
      sauce: {
        id: currentSauce._id,
        name: currentSauce.name,
        price: currentSauce.priceModifier || 0,
      },
      cheese: {
        id: currentCheese._id,
        name: currentCheese.name,
        price: currentCheese.priceModifier || 0,
      },
      veggies: selectedVeggieItems.map((v) => ({
        id: v._id,
        name: v.name,
        price: v.priceModifier || 0,
      })),
      unitPrice: serverUnitPrice,
      quantity,
    });

    showToast(`Added "${customName}" to your cart! 🍕`, 'success');
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-oasis-light">
        <div className="w-12 h-12 border-4 border-oasis-red border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-oasis-muted">Setting up pizza crafting station...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-center space-y-3">
        <AlertCircle className="w-10 h-10 mx-auto" />
        <h3 className="font-serif text-xl font-bold">Pizza Station Unavailable</h3>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-oasis-amber/10 border border-oasis-amber/30 text-oasis-amber text-xs font-semibold uppercase tracking-wider">
          <Flame className="w-3.5 h-3.5 text-oasis-red" />
          Live Interactive Pizza Studio
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-black text-white">
          Custom Artisan Pizza Builder
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Choose from 5 slow-fermented bases, 5 authentic sauces, gourmet cheeses, and fresh farm toppings. All prices are calculated securely on the server with live inventory checks.
        </p>
      </div>

      {/* Main Builder Grid: Visualizer & Selectors on Left, Sticky Summary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8 Columns: Live Visualizer & Step Selectors */}
        <div className="lg:col-span-8 space-y-8">
          {/* Pizza Visualizer Card */}
          <div className="p-8 rounded-3xl bg-oasis-card border border-oasis-border shadow-xl relative overflow-hidden flex flex-col items-center justify-center text-center">
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-semibold text-slate-300">Live Oven Preview</span>
            </div>

            <div className="my-6">
              <PizzaVisualizer
                baseName={currentBase?.name}
                sauceName={currentSauce?.name}
                cheeseName={currentCheese?.name}
                veggieNames={currentVeggieNames}
                size="lg"
              />
            </div>

            {/* Current Layers Snapshot */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
              <span className="px-3 py-1 rounded-full bg-oasis-dark border border-white/10">
                Crust: <strong className="text-oasis-amber">{currentBase?.name}</strong>
              </span>
              <span className="px-3 py-1 rounded-full bg-oasis-dark border border-white/10">
                Sauce: <strong className="text-oasis-red">{currentSauce?.name}</strong>
              </span>
              <span className="px-3 py-1 rounded-full bg-oasis-dark border border-white/10">
                Cheese: <strong className="text-oasis-gold">{currentCheese?.name}</strong>
              </span>
              <span className="px-3 py-1 rounded-full bg-oasis-dark border border-white/10">
                Toppings: <strong className="text-emerald-400">{selectedVeggieIds.length} Selected</strong>
              </span>
            </div>
          </div>

          {/* Builder Step Tabs */}
          <div className="flex border-b border-oasis-border/60 overflow-x-auto scrollbar-none gap-2">
            {[
              { id: 'base', label: '1. Crust Base (5 Options)', count: bases.length },
              { id: 'sauce', label: '2. Sauce (5 Options)', count: sauces.length },
              { id: 'cheese', label: '3. Cheese', count: cheeses.length },
              { id: 'veggie', label: '4. Farm Veggies & Toppings', count: veggies.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveStep(tab.id as any)}
                className={`pb-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeStep === tab.id
                    ? 'border-oasis-red text-white'
                    : 'border-transparent text-oasis-muted hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Step 1: Bases */}
          {activeStep === 'base' && (
            <div className="space-y-4 animate-in fade-in-50 duration-300">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-bold text-white">Select Your Crust Base</h3>
                <span className="text-xs text-oasis-muted">Required (1 Selection)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {bases.map((base) => {
                  const isSelected = selectedBaseId === base._id;
                  const isAvailable = base.isAvailable && base.availableQuantity > 0;

                  return (
                    <button
                      key={base._id}
                      disabled={!isAvailable}
                      onClick={() => setSelectedBaseId(base._id)}
                      className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'bg-oasis-red/10 border-oasis-red shadow-glow-red'
                          : isAvailable
                          ? 'bg-oasis-card border-oasis-border hover:border-oasis-amber/50 hover:bg-oasis-card/80'
                          : 'bg-oasis-dark/50 border-oasis-border/30 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif font-bold text-base text-white">{base.name}</h4>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-oasis-red text-white flex items-center justify-center">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-oasis-muted mt-1 leading-relaxed">{base.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                        <span className="font-bold text-oasis-amber">
                          {base.priceModifier === 0 ? 'Included' : `+₹${base.priceModifier}`}
                        </span>
                        {isAvailable ? (
                          base.availableQuantity <= base.lowStockThreshold ? (
                            <span className="text-[11px] text-amber-400 font-medium">Only {base.availableQuantity} left!</span>
                          ) : (
                            <span className="text-[11px] text-emerald-400 font-medium">In Stock</span>
                          )
                        ) : (
                          <span className="text-[11px] text-rose-400 font-medium">Sold Out</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Sauces */}
          {activeStep === 'sauce' && (
            <div className="space-y-4 animate-in fade-in-50 duration-300">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-bold text-white">Select Your Artisan Sauce</h3>
                <span className="text-xs text-oasis-muted">Required (1 Selection)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sauces.map((sauce) => {
                  const isSelected = selectedSauceId === sauce._id;
                  const isAvailable = sauce.isAvailable && sauce.availableQuantity > 0;

                  return (
                    <button
                      key={sauce._id}
                      disabled={!isAvailable}
                      onClick={() => setSelectedSauceId(sauce._id)}
                      className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'bg-oasis-red/10 border-oasis-red shadow-glow-red'
                          : isAvailable
                          ? 'bg-oasis-card border-oasis-border hover:border-oasis-amber/50 hover:bg-oasis-card/80'
                          : 'bg-oasis-dark/50 border-oasis-border/30 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-base text-white">{sauce.name}</h4>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-oasis-red text-white flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-oasis-muted mt-1 leading-relaxed">{sauce.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                        <span className="font-bold text-oasis-amber">
                          {sauce.priceModifier === 0 ? 'Included' : `+₹${sauce.priceModifier}`}
                        </span>
                        {isAvailable ? (
                          <span className="text-[11px] text-emerald-400 font-medium">In Stock</span>
                        ) : (
                          <span className="text-[11px] text-rose-400 font-medium">Sold Out</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Cheeses */}
          {activeStep === 'cheese' && (
            <div className="space-y-4 animate-in fade-in-50 duration-300">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-bold text-white">Select Melted Cheese Blend</h3>
                <span className="text-xs text-oasis-muted">Required (1 Selection)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cheeses.map((cheese) => {
                  const isSelected = selectedCheeseId === cheese._id;
                  const isAvailable = cheese.isAvailable && cheese.availableQuantity > 0;

                  return (
                    <button
                      key={cheese._id}
                      disabled={!isAvailable}
                      onClick={() => setSelectedCheeseId(cheese._id)}
                      className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'bg-oasis-red/10 border-oasis-red shadow-glow-red'
                          : isAvailable
                          ? 'bg-oasis-card border-oasis-border hover:border-oasis-amber/50 hover:bg-oasis-card/80'
                          : 'bg-oasis-dark/50 border-oasis-border/30 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-base text-white">{cheese.name}</h4>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-oasis-red text-white flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-oasis-muted mt-1 leading-relaxed">{cheese.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                        <span className="font-bold text-oasis-amber">+₹{cheese.priceModifier}</span>
                        {isAvailable ? (
                          <span className="text-[11px] text-emerald-400 font-medium">In Stock</span>
                        ) : (
                          <span className="text-[11px] text-rose-400 font-medium">Sold Out</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Vegetables & Toppings (Multi-select) */}
          {activeStep === 'veggie' && (
            <div className="space-y-4 animate-in fade-in-50 duration-300">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-bold text-white">Choose Vegetables & Toppings</h3>
                <span className="text-xs text-oasis-amber font-medium">
                  {selectedVeggieIds.length} Selected (Multiple allowed)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {veggies.map((veg) => {
                  const isSelected = selectedVeggieIds.includes(veg._id);
                  const isAvailable = veg.isAvailable && veg.availableQuantity > 0;

                  return (
                    <button
                      key={veg._id}
                      disabled={!isAvailable}
                      onClick={() => toggleVeggie(veg._id, isAvailable)}
                      className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'bg-oasis-red/15 border-oasis-red shadow-sm'
                          : isAvailable
                          ? 'bg-oasis-card border-oasis-border hover:border-oasis-amber/50'
                          : 'bg-oasis-dark/50 border-oasis-border/30 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-sm text-white">{veg.name}</span>
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-oasis-red border-oasis-red text-white'
                              : 'border-oasis-border bg-oasis-dark'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                        <span className="text-oasis-amber font-semibold">+₹{veg.priceModifier}</span>
                        {isAvailable ? (
                          <span className="text-[10px] text-emerald-400">In Stock</span>
                        ) : (
                          <span className="text-[10px] text-rose-400">Sold Out</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right 4 Columns: Dynamic Server-Calculated Order Summary */}
        <div className="lg:col-span-4 sticky top-28 space-y-6">
          <div className="p-6 rounded-3xl bg-oasis-card border border-oasis-border shadow-2xl space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-oasis-red uppercase tracking-wider">Server Verified</span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Live Calculated
                </span>
              </div>

              {/* Pizza Name Input */}
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Give your pizza a name..."
                className="w-full px-3 py-2 rounded-xl bg-oasis-dark border border-oasis-border text-white text-base font-bold focus:outline-none focus:border-oasis-amber transition-colors"
              />
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 pt-3 border-t border-oasis-border/60 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Handcrafted Oven Base Fee</span>
                <span className="text-white font-medium">₹199</span>
              </div>

              {currentBase && (
                <div className="flex justify-between text-slate-300">
                  <span className="truncate pr-2">Crust: {currentBase.name}</span>
                  <span className="text-white font-medium">
                    {currentBase.priceModifier === 0 ? 'Free' : `+₹${currentBase.priceModifier}`}
                  </span>
                </div>
              )}

              {currentSauce && (
                <div className="flex justify-between text-slate-300">
                  <span className="truncate pr-2">Sauce: {currentSauce.name}</span>
                  <span className="text-white font-medium">
                    {currentSauce.priceModifier === 0 ? 'Free' : `+₹${currentSauce.priceModifier}`}
                  </span>
                </div>
              )}

              {currentCheese && (
                <div className="flex justify-between text-slate-300">
                  <span className="truncate pr-2">Cheese: {currentCheese.name}</span>
                  <span className="text-white font-medium">+₹{currentCheese.priceModifier}</span>
                </div>
              )}

              {selectedVeggieIds.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-slate-400 block font-semibold">Vegetables & Toppings:</span>
                  {veggies
                    .filter((v) => selectedVeggieIds.includes(v._id))
                    .map((v) => (
                      <div key={v._id} className="flex justify-between pl-2 text-slate-300">
                        <span>• {v.name}</span>
                        <span className="text-white font-medium">+₹{v.priceModifier}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Total Unit Price & Quantity */}
            <div className="pt-4 border-t border-oasis-border/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-oasis-muted uppercase tracking-wider block">Unit Price</span>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-3xl font-black text-white">₹{serverUnitPrice}</span>
                  {priceCalculating && <span className="text-[10px] text-oasis-amber animate-spin">⌛</span>}
                </div>
              </div>

              {/* Quantity Counter */}
              <div className="flex items-center gap-2 bg-oasis-dark p-1 rounded-xl border border-oasis-border">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-bold text-sm text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Grand Total */}
            <div className="p-4 rounded-2xl bg-oasis-dark/80 border border-oasis-border/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-oasis-muted block">Total for {quantity} pizza(s)</span>
                <span className="font-serif text-2xl font-bold text-oasis-amber">
                  ₹{serverUnitPrice * quantity}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Excl. 5% tax at checkout</span>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full py-4 rounded-2xl bg-oasis-red hover:bg-oasis-red-hover text-white font-bold text-base flex items-center justify-center gap-3 shadow-glow-red hover:scale-[1.02] active:scale-95 transition-all"
            >
              <ShoppingBag className="w-5 h-5 text-oasis-gold" />
              Add Custom Pizza to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
