import {
  BecomeSeller,
  BuyerProtection,
  HowItWorks,
  SellerSpotlight,
} from "../components";
import { Hero } from "../components/Hero";

export default function HomeTemplate() {
  return (
    <div className="min-h-screen">
      <Hero />
      <div className="px-5 sm:px-8">
        <div className="mx-auto w-full max-w-7xl lg:px-8">
          {/* Seguro do Comprador */}
          <BuyerProtection />

          {/* Vendedores Destaque */}
          <SellerSpotlight />

          {/* Torne-se um Vendedor */}
          <BecomeSeller />

          {/* Como Funciona */}
          <HowItWorks />
        </div>
      </div>
    </div>
  );
}
