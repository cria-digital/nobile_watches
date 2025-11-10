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
    href: "/carrinho",
    section: "gerenciamento",
  },
  {
    icon: "/icons/shopping-bag.svg",
    label: "Minhas compras",
    href: "/minhas-compras",
    section: "gerenciamento",
  },
  {
    icon: "/icons/heart-outline.svg",
    label: "Lista de desejos",
    href: "#",
    section: "gerenciamento",
  },
  // Meus dados
  {
    icon: "/icons/watch.svg",
    label: "Minha coleção",
    href: "/colecao",
    section: "meusDados",
  },
  {
    icon: "/icons/user-outline.svg",
    label: "Meu perfil",
    href: "/perfil",
    section: "meusDados",
  },
  {
    icon: "/icons/hand-user.svg",
    label: "Vender",
    href: "/vender-relogio",
    section: "meusDados",
  },
  {
    icon: "/icons/tag.svg",
    label: "Meus anúncios",
    href: "/meus-anuncios",
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
