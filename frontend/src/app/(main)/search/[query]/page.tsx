import { SearchPageClient } from "@/components/search/SearchPageClient";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface SearchPageProps {
  params: Promise<{
    query: string;
  }>;
}

export async function generateMetadata(props: SearchPageProps): Promise<Metadata> {
  const params = await props.params;
  const query = decodeURIComponent(params.query);

  return {
    title: `Busca: ${query} - Nobile`,
    description: `Resultados da busca por "${query}" na Nobile.`,
  };
}

export default async function SearchPage(props: SearchPageProps) {
  const params = await props.params;
  const query = decodeURIComponent(params.query);

  if (!query) {
    notFound();
  }

  return <SearchPageClient query={query} />;
}
