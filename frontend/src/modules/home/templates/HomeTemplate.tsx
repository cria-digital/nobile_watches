import { Categories } from "../components//Categories/Categories";
import { FeaturedProducts } from "../components/FeaturedProducts/FeaturedProducts";
import { Hero } from "../components/Hero/Hero";
import { HowItWorks } from "../components/HowItWorks/HowItWorks";

export default function HomeTemplate() {
  return (
    <div className="min-h-screen">
      <Hero />
      <FeaturedProducts />
      <Categories />
      <HowItWorks />
    </div>
  );
}
