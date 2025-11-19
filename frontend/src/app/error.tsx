"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log para serviço de monitoramento (Sentry, DataDog, etc)
    console.error("Root error:", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-white px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-3">Algo deu errado</h1>

            <p className="text-gray-600 mb-8">
              Ocorreu um erro inesperado ao carregar a página. Você pode tentar novamente
              ou voltar para a página inicial.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
              >
                Tentar novamente
              </button>

              <a
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
              >
                Ir para início
              </a>
            </div>

            {process.env.NODE_ENV === "development" && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Detalhes técnicos
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto text-left">
                  {error.message}
                  {error.digest && `\nDigest: ${error.digest}`}
                </pre>
              </details>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
