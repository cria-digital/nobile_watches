export interface MenuItem {
  icon: string;
  label: string;
  href: string;
  section: "gerenciamento" | "meusDados" | "opcoes";
}

export const USER_MENU_ITEMS: MenuItem[] = [
  // Gerenciamento
  {
    icon: "/icons/shopping-cart.svg",
    label: "Meu carrinho",
    href: "/account/cart",
    section: "gerenciamento",
  },
  {
    icon: "/icons/shopping-bag.svg",
    label: "Minhas compras",
    href: "/account/purchases",
    section: "gerenciamento",
  },
  {
    icon: "/icons/heart-outline.svg",
    label: "Lista de desejos",
    href: "/account/wishlist",
    section: "gerenciamento",
  },
  // Meus dados
  {
    icon: "/icons/watch.svg",
    label: "Minha coleção",
    href: "/account/collection",
    section: "meusDados",
  },
  {
    icon: "/icons/user.svg",
    label: "Meu perfil",
    href: "/account/profile",
    section: "meusDados",
  },
  {
    icon: "/icons/hand-user.svg",
    label: "Vender",
    href: "/account/listings?source=user-menu",
    section: "meusDados",
  },
  {
    icon: "/icons/tag.svg",
    label: "Meus anúncios",
    href: "/account/listings",
    section: "meusDados",
  },
  // Opções
  {
    icon: "/icons/logout-red.svg",
    label: "Sair",
    href: "#",
    section: "opcoes",
  },
];
