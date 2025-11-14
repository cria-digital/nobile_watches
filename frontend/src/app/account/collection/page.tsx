import CollectionPageClient from "@/components/user/CollectionPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Minha Coleção | Nobile",
  description: "Gerencie sua coleção de relógios de luxo",
};

export default function CollectionPage() {
  return <CollectionPageClient />;
}
