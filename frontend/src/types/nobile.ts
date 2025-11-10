// src/types/nobile.ts
export type Role = "BUYER" | "SELLER" | "ADMIN";

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
  role: Role;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Watch {
  id: number;
  brand: string;
  model: string;
  referenceNumber?: string;
  movement?: string;
  year?: number;
  condition: string;
  price: number;
  description?: string;
  images: string[];
  sellerId: number;
  createdAt: string;
  updatedAt: string;
  caseMaterial?: string;
  caseDiameter?: number;
  waterResistance?: string;
  glassType?: string;
  dialColor?: string;
  braceletMaterial?: string;
  braceletColor?: string;
  claspType?: string;
  gender?: string;
  seller?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface Order {
  id: number;
  buyerId: number;
  watchId: number;
  status: string;
  paymentInfo?: string;
  shippingInfo?: string;
  createdAt: string;
  buyer?: User;
  watch?: Watch;
}

export interface Message {
  id: number;
  fromUserId: number;
  toUserId: number;
  watchId?: number;
  content: string;
  timestamp: string;
  fromUser?: {
    id: number;
    name: string;
    email: string;
  };
  toUser?: {
    id: number;
    name: string;
    email: string;
  };
  watch?: Watch;
}

export interface Collection {
  id: number;
  userId: number;
  watchId: number;
  estimatedValue?: number;
  user?: User;
  watch?: Watch;
}

export interface PriceHistory {
  id: number;
  watchModel: string;
  date: string;
  averagePrice: number;
  watchId?: number;
}

export interface AdminLog {
  id: number;
  action: string;
  userId: number;
  timestamp: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}
