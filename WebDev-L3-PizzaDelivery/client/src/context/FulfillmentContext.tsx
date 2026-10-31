import React, { createContext, useContext, useState, useEffect } from 'react';

export type FulfillmentMode = 'delivery' | 'takeaway';

export interface OutletInfo {
  id: string;
  name: string;
  neighborhood: string;
  address: string;
  city: string;
  phone: string;
  pickupTimeMin: number;
  openHours: string;
  isKitchenActive: boolean;
}

export interface DeliveryAddressState {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  instructions: string;
}

// Configurable Oasis Kitchen Outlets (No invented real company branches; configurable for evaluator/admin)
export const DEFAULT_CONFIGURED_OUTLETS: OutletInfo[] = [
  {
    id: 'outlet_bandra',
    name: 'Oasis Central Wood-Stone Hearth',
    neighborhood: 'Bandra West',
    address: 'Plot 14, Hill Road, Near Mehboob Studio',
    city: 'Mumbai',
    phone: '+91 98200 12345',
    pickupTimeMin: 15,
    openHours: '11:00 AM - 11:30 PM',
    isKitchenActive: true,
  },
  {
    id: 'outlet_colaba',
    name: 'Oasis Heritage Artisan Kitchen',
    neighborhood: 'Colaba Causeway',
    address: '42, Shahid Bhagat Singh Road, Apollo Bandar',
    city: 'Mumbai',
    phone: '+91 98200 67890',
    pickupTimeMin: 20,
    openHours: '11:00 AM - 11:00 PM',
    isKitchenActive: true,
  },
  {
    id: 'outlet_juhu',
    name: 'Oasis Coastal Brick Oven Deck',
    neighborhood: 'Juhu Tara Road',
    address: '88, Near Juhu Beach Circle',
    city: 'Mumbai',
    phone: '+91 98200 54321',
    pickupTimeMin: 15,
    openHours: '11:30 AM - 12:00 AM',
    isKitchenActive: true,
  },
];

interface FulfillmentContextType {
  mode: FulfillmentMode;
  setMode: (mode: FulfillmentMode) => void;
  selectedOutlet: OutletInfo;
  setSelectedOutlet: (outlet: OutletInfo) => void;
  configuredOutlets: OutletInfo[];
  deliveryAddress: DeliveryAddressState;
  setDeliveryAddress: React.Dispatch<React.SetStateAction<DeliveryAddressState>>;
  updateDeliveryAddress: (patch: Partial<DeliveryAddressState>) => void;
  isFulfillmentModalOpen: boolean;
  openFulfillmentModal: () => void;
  closeFulfillmentModal: () => void;
  estimatedTimeText: string;
}

const FulfillmentContext = createContext<FulfillmentContextType | undefined>(undefined);

const FULFILLMENT_STORAGE_KEY = 'oasis_fulfillment_mode';
const ADDRESS_STORAGE_KEY = 'oasis_delivery_address';
const OUTLET_STORAGE_KEY = 'oasis_selected_outlet_id';

export const FulfillmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<FulfillmentMode>(() => {
    try {
      const saved = localStorage.getItem(FULFILLMENT_STORAGE_KEY);
      return saved === 'takeaway' ? 'takeaway' : 'delivery';
    } catch {
      return 'delivery';
    }
  });

  const [selectedOutlet, setSelectedOutletState] = useState<OutletInfo>(() => {
    try {
      const savedId = localStorage.getItem(OUTLET_STORAGE_KEY);
      const found = DEFAULT_CONFIGURED_OUTLETS.find((o) => o.id === savedId);
      return found || DEFAULT_CONFIGURED_OUTLETS[0];
    } catch {
      return DEFAULT_CONFIGURED_OUTLETS[0];
    }
  });

  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddressState>(() => {
    try {
      const saved = localStorage.getItem(ADDRESS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      street: '124 Artisan Woodway, Apt 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400050',
      phone: '+91 98765 43210',
      instructions: 'Ring doorbell, leave on wood delivery rack.',
    };
  });

  const [isFulfillmentModalOpen, setIsFulfillmentModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(FULFILLMENT_STORAGE_KEY, mode);
    } catch (e) {
      console.error(e);
    }
  }, [mode]);

  useEffect(() => {
    try {
      localStorage.setItem(OUTLET_STORAGE_KEY, selectedOutlet.id);
    } catch (e) {
      console.error(e);
    }
  }, [selectedOutlet]);

  useEffect(() => {
    try {
      localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(deliveryAddress));
    } catch (e) {
      console.error(e);
    }
  }, [deliveryAddress]);

  const setMode = (newMode: FulfillmentMode) => {
    setModeState(newMode);
  };

  const setSelectedOutlet = (outlet: OutletInfo) => {
    setSelectedOutletState(outlet);
  };

  const updateDeliveryAddress = (patch: Partial<DeliveryAddressState>) => {
    setDeliveryAddress((prev) => ({ ...prev, ...patch }));
  };

  const estimatedTimeText =
    mode === 'delivery'
      ? '🛵 Delivery in ~30-35 mins'
      : `🥡 Ready for Pickup in ~${selectedOutlet.pickupTimeMin} mins`;

  return (
    <FulfillmentContext.Provider
      value={{
        mode,
        setMode,
        selectedOutlet,
        setSelectedOutlet,
        configuredOutlets: DEFAULT_CONFIGURED_OUTLETS,
        deliveryAddress,
        setDeliveryAddress,
        updateDeliveryAddress,
        isFulfillmentModalOpen,
        openFulfillmentModal: () => setIsFulfillmentModalOpen(true),
        closeFulfillmentModal: () => setIsFulfillmentModalOpen(false),
        estimatedTimeText,
      }}
    >
      {children}
    </FulfillmentContext.Provider>
  );
};

export const useFulfillment = (): FulfillmentContextType => {
  const context = useContext(FulfillmentContext);
  if (!context) {
    throw new Error('useFulfillment must be used within a FulfillmentProvider');
  }
  return context;
};

