export interface Brand {
  nome: string;
  img: string;
  href: string;
}

export const mockBrands: Brand[] = [
  { img: "/images/brand/marca1.svg", nome: "Rolex", href: "/rolex" },
  { img: "/images/brand/marca2.svg", nome: "Tag Heuer", href: "/tag-heuer" },
  { img: "/images/brand/marca3.svg", nome: "Breitling", href: "/breitling" },
  { img: "/images/brand/marca4.svg", nome: "Audemars Piguet", href: "/audemars-piguet" },
  { img: "/images/brand/marca5.svg", nome: "Patek Philippe", href: "/patek-philippe" },
  { img: "/images/brand/marca6.svg", nome: "Hublot", href: "/hublot" },
  { img: "/images/brand/marca7.svg", nome: "Cartier", href: "/cartier" },
  // { img: "/images/brand/marca8.svg", nome: "Seiko", href: "/seiko" },
  { img: "/images/brand/marca9.svg", nome: "Omega", href: "/omega" },
  { img: "/images/brand/marca10.svg", nome: "IWC", href: "/iwc" },
  {
    img: "/images/mock/logos/vacheron-constantin.svg",
    nome: "Vacheron Constantin",
    href: "/vacheron-constantin",
  },
];
