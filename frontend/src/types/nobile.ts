import { Product } from "./product";

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

interface Seller {
  id: number;
  name: string;
  email: string;
  isVerified: boolean;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
}

interface WatchListing {
  id: number;
  status: "ACTIVE" | "DRAFT" | "PAUSED" | "SOLD" | "CANCELLED";
  titleSuffix?: string;
  shippingInfo?: string;
  returnPolicy?: string;
  deliveryTime?: string;
  negotiable: boolean;
  publishedAt?: string;
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

  seller: Seller;
  listings?: WatchListing[];
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

export interface WishlistItem {
  id: number;
  userId: number;
  watchId: number;
  addedAt: string;
  watch: Product;
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

// ===============================================
// TIPOS PARA LISTINGS
// ===============================================

/**
 * Status possíveis de um anúncio
 */
export enum ListingStatus {
  DRAFT = "DRAFT", // Rascunho
  ACTIVE = "ACTIVE", // Ativo
  PAUSED = "PAUSED", // Pausado
  CANCELLED = "CANCELLED", // Cancelado
  SOLD = "SOLD", // Vendido
}

export interface Listing {
  id: number;
  watchId: number;
  status: ListingStatus;
  titleSuffix?: string;
  shippingInfo?: string;
  returnPolicy?: string;
  deliveryTime?: string;
  negotiable: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  pausedAt?: string;
  cancelledAt?: string;
  soldAt?: string;
  watch?: Watch;
}

/**
 * Request para criar novo anúncio
 */
export interface CreateListingRequest {
  watchId: number;
  shippingInfo?: string;
  returnPolicy?: string;
  deliveryTime?: string;
  negotiable?: boolean;
  titleSuffix?: string;
  publishNow: boolean;
}

/**
 * Request para atualizar anúncio
 */
export interface UpdateListingRequest {
  titleSuffix?: string;
  shippingInfo?: string;
  returnPolicy?: string;
  deliveryTime?: string;
  negotiable?: boolean;
}

/**
 * Response padrão de operações de listing
 */
export interface ListingResponse {
  message: string;
  listing: Listing;
}

/**
 * Response de listagem de anúncios ativos (com paginação)
 */
export interface ActiveListingsResponse {
  listings: Listing[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

/**
 * Response de deleção de anúncio
 */
export interface DeleteListingResponse {
  message: string;
}

export interface SearchFilterOptions {
  brands: string[];
  caseMaterials: string[];
  braceletMaterials: string[];
  movements: string[];
  conditions: string[];
  dialColors: string[];
  genders: string[];
  priceRange: {
    min: number;
    max: number;
  };
  yearRange: {
    min: number;
    max: number;
  };
  diameterRange: {
    min: number;
    max: number;
  };
}
