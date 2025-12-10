import Constants from 'expo-constants';

const getBaseUrl = () => {
  const domain = Constants.expoConfig?.extra?.domain || process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) {
    return `https://${domain.replace(':5000', '')}`;
  }
  return 'http://localhost:5000';
};

const BASE_URL = getBaseUrl();

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${BASE_URL}/api${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getCategories() {
    return this.request<Category[]>('/categories');
  }

  async getCategory(id: string) {
    return this.request<Category>(`/categories/${id}`);
  }

  async getProducts(params?: { categoryId?: string; search?: string; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    
    const query = searchParams.toString();
    return this.request<Product[]>(`/products${query ? `?${query}` : ''}`);
  }

  async getProduct(id: string) {
    return this.request<Product>(`/products/${id}`);
  }

  async register(data: { name: string; email: string; phone?: string; password: string }) {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe() {
    return this.request<User>('/auth/me');
  }

  async logout() {
    return this.request<{ success: boolean }>('/auth/logout', { method: 'POST' });
  }

  async getAddresses() {
    return this.request<Address[]>('/addresses');
  }

  async addAddress(data: Omit<Address, 'id' | 'userId' | 'createdAt'>) {
    return this.request<Address>('/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteAddress(id: string) {
    return this.request<{ success: boolean }>(`/addresses/${id}`, { method: 'DELETE' });
  }

  async getWishlist() {
    return this.request<WishlistItem[]>('/wishlist');
  }

  async toggleWishlist(productId: string) {
    return this.request<{ added: boolean }>(`/wishlist/${productId}`, { method: 'POST' });
  }

  async getCart() {
    return this.request<CartItemResponse[]>('/cart');
  }

  async addToCart(data: { productId: string; quantity: number; selectedSize?: string; selectedColor?: string }) {
    return this.request<{ success: boolean }>('/cart', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCartItem(id: string, quantity: number) {
    return this.request<{ success: boolean }>(`/cart/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(id: string) {
    return this.request<{ success: boolean }>(`/cart/${id}`, { method: 'DELETE' });
  }

  async clearCart() {
    return this.request<{ success: boolean }>('/cart', { method: 'DELETE' });
  }

  async getOrders() {
    return this.request<Order[]>('/orders');
  }

  async getOrder(id: string) {
    return this.request<Order>(`/orders/${id}`);
  }

  async createOrder(data: {
    items: OrderItem[];
    total: string;
    deliveryFee: string;
    addressId: string;
    addressSnapshot: AddressSnapshot;
  }) {
    return this.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  image: string | null;
  productCount: number | null;
}

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: string;
  originalPrice: string | null;
  images: string[] | null;
  categoryId: string | null;
  rating: string | null;
  reviewCount: number | null;
  variants: {
    sizes?: string[];
    colors?: { name: string; value: string }[];
  } | null;
  inStock: boolean | null;
  sellerId: string | null;
  sellerName: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  fullName: string;
  phone: string;
  area: string;
  block: string;
  street: string;
  building: string;
  floor: string | null;
  apartment: string | null;
  notes: string | null;
  isDefault: boolean | null;
  createdAt: Date | null;
}

export interface AddressSnapshot {
  label: string;
  fullName: string;
  phone: string;
  area: string;
  block: string;
  street: string;
  building: string;
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product | null;
}

export interface CartItemResponse {
  id: string;
  quantity: number | null;
  selectedSize: string | null;
  selectedColor: string | null;
  product: Product | null;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productNameAr: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  image?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: string;
  deliveryFee: string | null;
  status: 'pending' | 'confirmed' | 'out_for_delivery' | 'delivered' | null;
  addressId: string | null;
  addressSnapshot: AddressSnapshot | null;
  estimatedDelivery: Date | null;
  createdAt: Date | null;
}
