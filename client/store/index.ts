import { create } from "zustand";

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  originalPrice?: number;
  images: string[];
  categoryId: string;
  rating: number;
  reviewCount: number;
  variants?: {
    sizes?: string[];
    colors?: { name: string; value: string }[];
  };
  inStock: boolean;
  sellerId: string;
  sellerName: string;
}

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  image: string;
  productCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  area: string;
  block: string;
  street: string;
  building: string;
  floor?: string;
  apartment?: string;
  notes?: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  deliveryFee: number;
  status: "pending" | "confirmed" | "out_for_delivery" | "delivered";
  address: Address;
  createdAt: Date;
  estimatedDelivery?: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

interface AppState {
  user: User | null;
  cart: CartItem[];
  wishlist: string[];
  addresses: Address[];
  orders: Order[];
  language: "ar" | "en";
  
  setUser: (user: User | null) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  addAddress: (address: Address) => void;
  removeAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => void;
  addOrder: (order: Order) => void;
  setLanguage: (lang: "ar" | "en") => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  cart: [],
  wishlist: [],
  addresses: [],
  orders: [],
  language: "ar",

  setUser: (user) => set({ user }),

  addToCart: (item) => {
    const { cart } = get();
    const existingIndex = cart.findIndex(
      (i) =>
        i.product.id === item.product.id &&
        i.selectedSize === item.selectedSize &&
        i.selectedColor === item.selectedColor
    );
    if (existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += item.quantity;
      set({ cart: newCart });
    } else {
      set({ cart: [...cart, item] });
    }
  },

  removeFromCart: (productId) => {
    set({ cart: get().cart.filter((i) => i.product.id !== productId) });
  },

  updateCartQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    const newCart = get().cart.map((i) =>
      i.product.id === productId ? { ...i, quantity } : i
    );
    set({ cart: newCart });
  },

  clearCart: () => set({ cart: [] }),

  toggleWishlist: (productId) => {
    const { wishlist } = get();
    if (wishlist.includes(productId)) {
      set({ wishlist: wishlist.filter((id) => id !== productId) });
    } else {
      set({ wishlist: [...wishlist, productId] });
    }
  },

  isInWishlist: (productId) => get().wishlist.includes(productId),

  addAddress: (address) => {
    const { addresses } = get();
    if (address.isDefault) {
      const updated = addresses.map((a) => ({ ...a, isDefault: false }));
      set({ addresses: [...updated, address] });
    } else {
      set({ addresses: [...addresses, address] });
    }
  },

  removeAddress: (addressId) => {
    set({ addresses: get().addresses.filter((a) => a.id !== addressId) });
  },

  setDefaultAddress: (addressId) => {
    const newAddresses = get().addresses.map((a) => ({
      ...a,
      isDefault: a.id === addressId,
    }));
    set({ addresses: newAddresses });
  },

  addOrder: (order) => {
    set({ orders: [order, ...get().orders] });
  },

  setLanguage: (language) => set({ language }),

  getCartTotal: () => {
    return get().cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  },

  getCartItemCount: () => {
    return get().cart.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
