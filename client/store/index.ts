import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, Product as ApiProduct, User as ApiUser, Address as ApiAddress, Order as ApiOrder, CartItemResponse } from "@/api";

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
  id?: string;
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

function apiProductToProduct(p: ApiProduct): Product {
  return {
    id: p.id,
    name: p.name,
    nameAr: p.nameAr,
    description: p.description,
    descriptionAr: p.descriptionAr,
    price: parseFloat(p.price),
    originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : undefined,
    images: p.images || [],
    categoryId: p.categoryId || "",
    rating: p.rating ? parseFloat(p.rating) : 0,
    reviewCount: p.reviewCount || 0,
    variants: p.variants || undefined,
    inStock: p.inStock ?? true,
    sellerId: p.sellerId || "",
    sellerName: p.sellerName || "",
  };
}

interface AppState {
  user: User | null;
  token: string | null;
  cart: CartItem[];
  wishlist: string[];
  addresses: Address[];
  orders: Order[];
  language: "ar" | "en";
  isLoading: boolean;
  
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  syncWishlist: () => Promise<void>;
  
  addAddress: (address: Address) => void;
  removeAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => void;
  syncAddresses: () => Promise<void>;
  
  addOrder: (order: Order) => void;
  createOrder: (addressId: string, address: Address) => Promise<Order>;
  syncOrders: () => Promise<void>;
  
  setLanguage: (lang: "ar" | "en") => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      cart: [],
      wishlist: [],
      addresses: [],
      orders: [],
      language: "ar",
      isLoading: false,

      setUser: (user) => set({ user }),
      
      setToken: (token) => {
        api.setToken(token);
        set({ token });
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.login({ email, password });
          api.setToken(response.token);
          set({ 
            user: {
              id: response.user.id,
              name: response.user.name,
              email: response.user.email,
              phone: response.user.phone || undefined,
            },
            token: response.token,
            isLoading: false 
          });
          get().syncCart();
          get().syncWishlist();
          get().syncAddresses();
          get().syncOrders();
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (name, email, password, phone) => {
        set({ isLoading: true });
        try {
          const response = await api.register({ name, email, password, phone });
          api.setToken(response.token);
          set({ 
            user: {
              id: response.user.id,
              name: response.user.name,
              email: response.user.email,
              phone: response.user.phone || undefined,
            },
            token: response.token,
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.logout();
        } catch (e) {
        }
        api.setToken(null);
        set({ user: null, token: null, cart: [], wishlist: [], addresses: [], orders: [] });
      },

      addToCart: (item) => {
        const { cart, token } = get();
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

        if (token) {
          api.addToCart({
            productId: item.product.id,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor,
          }).catch(console.error);
        }
      },

      removeFromCart: (productId) => {
        const { cart, token } = get();
        const item = cart.find(i => i.product.id === productId);
        set({ cart: cart.filter((i) => i.product.id !== productId) });
        
        if (token && item?.id) {
          api.removeFromCart(item.id).catch(console.error);
        }
      },

      updateCartQuantity: (productId, quantity) => {
        const { cart, token } = get();
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        const item = cart.find(i => i.product.id === productId);
        const newCart = cart.map((i) =>
          i.product.id === productId ? { ...i, quantity } : i
        );
        set({ cart: newCart });
        
        if (token && item?.id) {
          api.updateCartItem(item.id, quantity).catch(console.error);
        }
      },

      clearCart: () => {
        const { token } = get();
        set({ cart: [] });
        if (token) {
          api.clearCart().catch(console.error);
        }
      },

      syncCart: async () => {
        const { token } = get();
        if (!token) return;
        
        try {
          const cartItems = await api.getCart();
          const cart: CartItem[] = cartItems
            .filter(item => item.product)
            .map(item => ({
              id: item.id,
              product: apiProductToProduct(item.product!),
              quantity: item.quantity || 1,
              selectedSize: item.selectedSize || undefined,
              selectedColor: item.selectedColor || undefined,
            }));
          set({ cart });
        } catch (e) {
          console.error("Failed to sync cart:", e);
        }
      },

      toggleWishlist: (productId) => {
        const { wishlist, token } = get();
        if (wishlist.includes(productId)) {
          set({ wishlist: wishlist.filter((id) => id !== productId) });
        } else {
          set({ wishlist: [...wishlist, productId] });
        }
        
        if (token) {
          api.toggleWishlist(productId).catch(console.error);
        }
      },

      isInWishlist: (productId) => get().wishlist.includes(productId),

      syncWishlist: async () => {
        const { token } = get();
        if (!token) return;
        
        try {
          const wishlistItems = await api.getWishlist();
          set({ wishlist: wishlistItems.map(item => item.productId) });
        } catch (e) {
          console.error("Failed to sync wishlist:", e);
        }
      },

      addAddress: (address) => {
        const { addresses, token } = get();
        if (address.isDefault) {
          const updated = addresses.map((a) => ({ ...a, isDefault: false }));
          set({ addresses: [...updated, address] });
        } else {
          set({ addresses: [...addresses, address] });
        }
        
        if (token) {
          api.addAddress({
            label: address.label,
            fullName: address.fullName,
            phone: address.phone,
            area: address.area,
            block: address.block,
            street: address.street,
            building: address.building,
            floor: address.floor || null,
            apartment: address.apartment || null,
            notes: address.notes || null,
            isDefault: address.isDefault,
          }).catch(console.error);
        }
      },

      removeAddress: (addressId) => {
        const { token } = get();
        set({ addresses: get().addresses.filter((a) => a.id !== addressId) });
        
        if (token) {
          api.deleteAddress(addressId).catch(console.error);
        }
      },

      setDefaultAddress: (addressId) => {
        const newAddresses = get().addresses.map((a) => ({
          ...a,
          isDefault: a.id === addressId,
        }));
        set({ addresses: newAddresses });
      },

      syncAddresses: async () => {
        const { token } = get();
        if (!token) return;
        
        try {
          const addresses = await api.getAddresses();
          set({ 
            addresses: addresses.map(a => ({
              id: a.id,
              label: a.label,
              fullName: a.fullName,
              phone: a.phone,
              area: a.area,
              block: a.block,
              street: a.street,
              building: a.building,
              floor: a.floor || undefined,
              apartment: a.apartment || undefined,
              notes: a.notes || undefined,
              isDefault: a.isDefault || false,
            }))
          });
        } catch (e) {
          console.error("Failed to sync addresses:", e);
        }
      },

      addOrder: (order) => {
        set({ orders: [order, ...get().orders] });
      },

      createOrder: async (addressId, address) => {
        const { cart, token } = get();
        const total = get().getCartTotal();
        const deliveryFee = 2;
        
        const orderItems = cart.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          productNameAr: item.product.nameAr,
          price: item.product.price,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
          image: item.product.images[0],
        }));
        
        if (token) {
          const apiOrder = await api.createOrder({
            items: orderItems,
            total: total.toFixed(2),
            deliveryFee: deliveryFee.toFixed(2),
            addressId,
            addressSnapshot: {
              label: address.label,
              fullName: address.fullName,
              phone: address.phone,
              area: address.area,
              block: address.block,
              street: address.street,
              building: address.building,
            },
          });
          
          const order: Order = {
            id: apiOrder.id,
            items: cart,
            total: parseFloat(apiOrder.total),
            deliveryFee: parseFloat(apiOrder.deliveryFee || "2"),
            status: apiOrder.status || "pending",
            address,
            createdAt: new Date(apiOrder.createdAt || Date.now()),
            estimatedDelivery: apiOrder.estimatedDelivery ? new Date(apiOrder.estimatedDelivery) : undefined,
          };
          
          set({ orders: [order, ...get().orders], cart: [] });
          return order;
        } else {
          const order: Order = {
            id: `order-${Date.now()}`,
            items: cart,
            total,
            deliveryFee,
            status: "pending",
            address,
            createdAt: new Date(),
            estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          };
          
          set({ orders: [order, ...get().orders], cart: [] });
          return order;
        }
      },

      syncOrders: async () => {
        const { token } = get();
        if (!token) return;
        
        try {
          const apiOrders = await api.getOrders();
          const orders: Order[] = apiOrders.map(o => ({
            id: o.id,
            items: o.items.map(item => ({
              product: {
                id: item.productId,
                name: item.productName,
                nameAr: item.productNameAr,
                description: "",
                descriptionAr: "",
                price: item.price,
                images: item.image ? [item.image] : [],
                categoryId: "",
                rating: 0,
                reviewCount: 0,
                inStock: true,
                sellerId: "",
                sellerName: "",
              },
              quantity: item.quantity,
              selectedSize: item.selectedSize,
              selectedColor: item.selectedColor,
            })),
            total: parseFloat(o.total),
            deliveryFee: parseFloat(o.deliveryFee || "2"),
            status: o.status || "pending",
            address: o.addressSnapshot ? {
              id: o.addressId || "",
              label: o.addressSnapshot.label,
              fullName: o.addressSnapshot.fullName,
              phone: o.addressSnapshot.phone,
              area: o.addressSnapshot.area,
              block: o.addressSnapshot.block,
              street: o.addressSnapshot.street,
              building: o.addressSnapshot.building,
              isDefault: false,
            } : {
              id: "",
              label: "",
              fullName: "",
              phone: "",
              area: "",
              block: "",
              street: "",
              building: "",
              isDefault: false,
            },
            createdAt: new Date(o.createdAt || Date.now()),
            estimatedDelivery: o.estimatedDelivery ? new Date(o.estimatedDelivery) : undefined,
          }));
          set({ orders });
        } catch (e) {
          console.error("Failed to sync orders:", e);
        }
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
    }),
    {
      name: "sudanese-bazaar-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        cart: state.cart,
        wishlist: state.wishlist,
        addresses: state.addresses,
        language: state.language,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          api.setToken(state.token);
        }
      },
    }
  )
);
