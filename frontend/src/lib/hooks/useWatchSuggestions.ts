import { useCallback, useEffect, useRef, useState } from "react";
import { apiService, WatchSuggestion } from "../services/api.service";

interface UseWatchSuggestionsReturn {
  suggestions: WatchSuggestion[];
  loading: boolean;
  error: string | null;
  searchSuggestions: (query: string) => void;
  clearSuggestions: () => void;
}

/**
 * Hook customizado para buscar sugestões de relógios
 * Implementa debounce automático de 300ms
 */
export function useWatchSuggestions(debounceMs: number = 300): UseWatchSuggestionsReturn {
  const [suggestions, setSuggestions] = useState<WatchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await apiService.getWatchSuggestions(query);
      setSuggestions(results);
    } catch (err: any) {
      console.error("Erro ao buscar sugestões:", err);
      setError("Erro ao buscar sugestões. Tente novamente.");
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchSuggestions = useCallback(
    (query: string) => {
      // Limpa o timeout anterior
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      // Se a query for muito curta, limpa as sugestões
      if (query.length < 2) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      // Define um novo timeout
      debounceTimeout.current = setTimeout(() => {
        fetchSuggestions(query);
      }, debounceMs);
    },
    [fetchSuggestions, debounceMs]
  );

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
  }, []);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  return {
    suggestions,
    loading,
    error,
    searchSuggestions,
    clearSuggestions,
  };
}
