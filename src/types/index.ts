export interface Product {
  id: string; sku: string; brand: string;
  nameKa: string; nameEn: string; nameRu: string;
  name?: string; // backend fmtProduct returns pre-formatted name
  description?: string;
  price: number; priceOld?: number; discount?: number;
  stock: number; inStock?: boolean; images: string[]; badge?: string;
  isFeatured: boolean; isActive: boolean;
  categoryId?: string; category?: Category;
  rating?: number; reviewCount?: number;
  articleNumber?: string; compatibility?: string[];
}

export interface Category {
  id: string; slug: string;
  nameKa: string; nameEn: string; nameRu: string;
  icon?: string; parentId?: string;
  _count?: { products: number };
}

export interface Order {
  id: string; status: OrderStatus; paymentStatus: string;
  paymentMethod: string; total: number; deliveryFee: number;
  deliveryZone: string; createdAt: string;
  items: OrderItem[]; address?: Address; user?: User;
}

export interface OrderItem {
  id: string; productId: string; quantity: number; price: number;
  product?: Product;
}

export interface Address {
  id: string; city: string; street: string; apartment?: string; zone: string;
}

export interface User {
  id: string; name: string; email: string; phone?: string;
  role: 'USER' | 'ADMIN'; createdAt: string;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type Lang = 'ka' | 'en' | 'ru';
