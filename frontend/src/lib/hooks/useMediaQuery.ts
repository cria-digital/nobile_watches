import { useEffect, useState } from "react";

/**
 * Hook para detectar se está em desktop (largura >= 1024px)
 *
 * @returns {boolean} true se a largura da tela for >= 1024px
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isDesktop = useIsDesktop();
 *
 *   return (
 *     <div>
 *       {isDesktop ? (
 *         <DesktopView />
 *       ) : (
 *         <MobileView />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    // Verifica no mount
    checkIsDesktop();

    // Adiciona listener para resize
    window.addEventListener("resize", checkIsDesktop);

    // Cleanup
    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

  return isDesktop;
}

/**
 * Hook customizável para detectar qualquer breakpoint
 *
 * @param {number} breakpoint - Largura mínima em pixels
 * @returns {boolean} true se a largura da tela for >= breakpoint
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isTablet = useMediaQuery(768);
 *   const isDesktop = useMediaQuery(1024);
 *   const isWideScreen = useMediaQuery(1440);
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useMediaQuery(breakpoint: number) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const checkMatch = () => {
      setMatches(window.innerWidth >= breakpoint);
    };

    checkMatch();
    window.addEventListener("resize", checkMatch);

    return () => window.removeEventListener("resize", checkMatch);
  }, [breakpoint]);

  return matches;
}

/**
 * Hook para detectar largura exata da tela
 * Útil para cálculos dinâmicos baseados na largura
 *
 * @returns {number} largura atual da janela em pixels
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const width = useWindowWidth();
 *
 *   return (
 *     <div>
 *       Largura da tela: {width}px
 *       {width < 768 && <MobileMenu />}
 *       {width >= 768 && width < 1024 && <TabletMenu />}
 *       {width >= 1024 && <DesktopMenu />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useWindowWidth() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    // Set inicial
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}
