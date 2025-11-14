export interface Product {
  id: number;
  brand: string;
  model: string;
  referenceNumber?: string;
  movement?: string;
  year?: number;
  condition: string;
  price: number;
  description?: string;
  customTitleSuffix?: string;
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

  //não existem no back

  hasBox?: boolean;
  hasDocuments?: boolean;
}

export interface ProductFilters {
  brand?: string[];
  priceMin?: number;
  priceMax?: number;
  condition?: string[];
  movement?: string[];
  caseMaterial?: string[];
  caseSize?: string[];
}
