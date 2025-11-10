// Helper para gerenciar produtos exibidos no Hero banner
import { Product } from "@/types/product";

export interface HeroProduct {
  id: number;
  brand: string;
  model: string;
  image: string; // Imagem a ser exibida no Hero
  href: string; // Link para página do produto
}

/**
 * Gera o link correto para a página do produto
 * Formato: /brand-slug/model-slug-id
 */
export function generateProductLink(product: Product): string {
  const brandSlug = product.brand.toLowerCase().replace(/\s+/g, "-");
  const modelSlug = product.model.toLowerCase().replace(/\s+/g, "-");
  return `/${brandSlug}/${modelSlug}-${product.id}`;
}

/**
 * Seleciona a melhor imagem para o Hero banner
 * Prioridade: heroImage (se disponível no backend) > primeira imagem do array
 */
export function getHeroImage(product: Product): string {
  // Tenta acessar heroImage se existir (campo opcional do backend)
  const productWithHero = product as Product & { heroImage?: string | null };
  const heroImage = productWithHero.heroImage;

  // Prioridade 1: heroImage se for string válida
  if (typeof heroImage === "string" && heroImage.length > 0) {
    return heroImage;
  }

  // Prioridade 2: primeira imagem do array
  if (Array.isArray(product.images) && product.images.length > 0) {
    const firstImage = product.images[0];
    if (typeof firstImage === "string" && firstImage.length > 0) {
      return firstImage;
    }
  }

  // Fallback final: imagem placeholder
  return "/images/placeholder-watch.svg";
}

/**
 * Converte produtos da API para formato do Hero
 */
export function transformToHeroProduct(product: Product): HeroProduct {
  return {
    id: product.id,
    brand: product.brand,
    model: product.model,
    image: getHeroImage(product),
    href: generateProductLink(product),
  };
}

/**
 * Seleciona 4 produtos para exibir no Hero
 * Estratégia:
 * 1. Prioriza produtos com heroImage definida
 * 2. Completa com produtos de marcas premium
 * 3. Garante diversidade de marcas
 */
export function selectHeroProducts(products: Product[]): HeroProduct[] {
  if (!products || products.length === 0) {
    return [];
  }

  const premiumBrands = [
    "Rolex",
    "Patek Philippe",
    "Audemars Piguet",
    "Omega",
    "Breitling",
    "Hublot",
    "Cartier",
    "IWC",
    "Tag Heuer",
  ];

  // 1. Produtos com heroImage têm prioridade máxima
  const withHeroImage = products.filter(p => {
    const productWithHero = p as Product & { heroImage?: string };
    return Boolean(productWithHero.heroImage);
  });

  // 2. Produtos de marcas premium sem heroImage
  const premiumProducts = products.filter(p => {
    const productWithHero = p as Product & { heroImage?: string };
    return !productWithHero.heroImage && premiumBrands.includes(p.brand);
  });

  // 3. Outros produtos
  const otherProducts = products.filter(p => {
    const productWithHero = p as Product & { heroImage?: string };
    return !productWithHero.heroImage && !premiumBrands.includes(p.brand);
  });

  // Combina e seleciona 4 produtos únicos por marca
  const selected: Product[] = [];
  const usedBrands = new Set<string>();

  // Helper para adicionar produto garantindo diversidade
  const addProduct = (productList: Product[]) => {
    for (const product of productList) {
      if (selected.length >= 4) break;
      if (!usedBrands.has(product.brand)) {
        selected.push(product);
        usedBrands.add(product.brand);
      }
    }
  };

  // Adiciona na ordem de prioridade
  addProduct(withHeroImage);
  addProduct(premiumProducts);
  addProduct(otherProducts);

  // Se ainda não temos 4, permite marcas repetidas
  if (selected.length < 4) {
    const remaining = [...withHeroImage, ...premiumProducts, ...otherProducts]
      .filter(p => !selected.includes(p))
      .slice(0, 4 - selected.length);
    selected.push(...remaining);
  }

  return selected.map(transformToHeroProduct);
}

/**
 * Mock products para fallback (mantém compatibilidade com design atual)
 */
export const mockHeroProducts: HeroProduct[] = [
  {
    id: 12,
    brand: "Rolex",
    model: "Deepsea",
    image: "/images/hero/banner1.svg",
    href: "/rolex/deepsea-12",
  },
  {
    id: 9,
    brand: "Rolex",
    model: "Oyster Perpetual",
    image: "/images/hero/banner2.svg",
    href: "/rolex/oyster-perpetual-9",
  },
  {
    id: 14,
    brand: "Patek Philippe",
    model: "Nautilus",
    image: "/images/hero/banner3.svg",
    href: "/patek-philippe/nautilus-14",
  },
  {
    id: 15,
    brand: "Breitling",
    model: "Superocean Heritage",
    image: "/images/hero/banner4.svg",
    href: "/breitling/superocean-heritage-15",
  },
];
