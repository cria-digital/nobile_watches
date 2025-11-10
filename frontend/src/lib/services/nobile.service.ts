// src/services/nobile.service.ts
import {
  AdminLog,
  Collection,
  Message,
  Order,
  PriceHistory,
  Watch,
} from "@/types/nobile";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para inserir token JWT automaticamente
api.interceptors.request.use(
  config => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Interceptor global de respostas (tratamento de erros)
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      if (typeof window !== "undefined") window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Classe principal do serviço de integração com o backend Nobile
class NobileService {
  // ============================
  // AUTENTICAÇÃO
  // ============================
  async register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    country?: string;
    state?: string;
    city?: string;
    role?: "BUYER" | "SELLER" | "ADMIN";
  }) {
    const response = await api.post("/auth/register", data);
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await api.post("/auth/login", { email, password });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  }

  logout() {
    localStorage.removeItem("token");
  }

  // ============================
  // RELÓGIOS
  // ============================
  async getWatches(): Promise<Watch[]> {
    const response = await api.get("/watches");
    return response.data;
  }

  async getWatch(id: number): Promise<Watch> {
    const response = await api.get(`/watches/${id}`);
    return response.data;
  }

  async createWatch(formData: FormData) {
    const response = await api.post("/watches", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }

  async updateWatch(id: number, data: Partial<Watch>) {
    const response = await api.put(`/watches/${id}`, data);
    return response.data;
  }

  async deleteWatch(id: number) {
    const response = await api.delete(`/watches/${id}`);
    return response.data;
  }

  // ============================
  // PEDIDOS
  // ============================
  async createOrder(watchId: number) {
    const response = await api.post("/orders", { watchId });
    return response.data;
  }

  async getOrders(): Promise<Order[]> {
    const response = await api.get("/orders");
    return response.data;
  }

  async updateOrderStatus(id: number, status: string) {
    const response = await api.put(`/orders/${id}`, { status });
    return response.data;
  }

  async createCheckout(orderId: number) {
    const response = await api.post(`/orders/checkout/${orderId}`);
    return response.data;
  }

  async verifyPayment(sessionId: string) {
    const response = await api.get("/orders/verificar-pagamento", {
      params: { sessionId },
    });
    return response.data;
  }

  async confirmDelivery(orderId: number) {
    const response = await api.put(`/orders/${orderId}/confirm-delivery`);
    return response.data;
  }

  async processPayout(orderId: number) {
    const response = await api.post(`/orders/payout/${orderId}`);
    return response.data;
  }

  // ============================
  // MENSAGENS
  // ============================
  async sendMessage(data: {
    toUserId: number;
    content: string;
    watchId?: number;
  }): Promise<Message> {
    const response = await api.post("/messages", data);
    return response.data;
  }

  async getMessages(): Promise<Message[]> {
    const response = await api.get("/messages");
    return response.data;
  }

  // ============================
  // COLEÇÕES
  // ============================
  async addToCollection(watchId: number, estimatedValue?: number) {
    const response = await api.post("/collections", {
      watchId,
      estimatedValue,
    });
    return response.data;
  }

  async getCollection(): Promise<Collection[]> {
    const response = await api.get("/collections");
    return response.data;
  }

  async updateCollectionValue(id: number, estimatedValue: number) {
    const response = await api.put(`/collections/${id}`, { estimatedValue });
    return response.data;
  }

  async removeFromCollection(watchId: number) {
    const response = await api.delete(`/collections/${watchId}`);
    return response.data;
  }

  // ============================
  // HISTÓRICO DE PREÇOS
  // ============================
  async getPriceHistory(watchId: number): Promise<PriceHistory[]> {
    const response = await api.get(`/price-history/${watchId}`);
    return response.data;
  }

  // ============================
  // ADMIN
  // ============================
  async getReports() {
    const response = await api.get("/admin/reports");
    return response.data;
  }

  async getAdminLogs(): Promise<AdminLog[]> {
    const response = await api.get("/admin/logs");
    return response.data;
  }
}

export default new NobileService();
