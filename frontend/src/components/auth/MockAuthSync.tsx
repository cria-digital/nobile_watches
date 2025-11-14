"use client";

import { useEffect } from "react";

export function MockAuthSync() {
  useEffect(() => {
    const mock = localStorage.getItem("mock_auth_token");

    if (mock === "mock_token_active") {
      document.cookie = `mock_auth_token=${mock}; path=/`;
    }

    if (!mock) {
      // opcional: remover cookie quando não estiver usando mock
      document.cookie = "mock_auth_token=; Max-Age=0; path=/";
    }
  }, []);

  return null;
}
