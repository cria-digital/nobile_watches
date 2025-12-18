import { CollectionPageClient } from "@/components/collection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Minha Coleção | Nobile",
  description: "Gerencie sua coleção de relógios de luxo",
};

export default function CollectionPage() {
  return <CollectionPageClient />;
}
