# Documentação da API - Nobile

## Base URL
```
http://localhost:3000/api
```

## Autenticação

A maioria das rotas requer autenticação via JWT. Envie o token no header:
```typescript
headers: {
  'Authorization': `Bearer ${token}`
}
```

---

## Rotas

### Autenticação

#### 1. Registrar Usuário
**POST** `/auth/register`

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123",
  "phone": "11999999999",
  "country": "Brasil",
  "state": "SP",
  "city": "São Paulo",
  "role": "BUYER"
}
```

**Resposta (201):**
```json
{
  "message": "Usuário registrado com sucesso.",
  "user": {
    "id": 1,
    "email": "joao@example.com",
    "role": "BUYER",
    "name": "João Silva"
  }
}
```

---

#### 2. Login
**POST** `/auth/login`

**Body:**
```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Resposta (200):**
```json
{
  "message": "Login realizado com sucesso.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@example.com",
    "role": "BUYER"
  }
}
```

---

### Relógios (Watches)

#### 1. Listar Todos os Relógios
**GET** `/watches`

**Autenticação:** Não requerida

**Resposta (200):**
```json
[
  {
    "id": 1,
    "brand": "Rolex",
    "model": "Submariner",
    "referenceNumber": "116610LN",
    "movement": "Automático",
    "year": 2020,
    "condition": "Novo",
    "price": 85000.00,
    "description": "Relógio icônico de mergulho",
    "images": ["https://cloudinary.com/..."],
    "sellerId": 2,
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z",
    "caseMaterial": "Aço Inoxidável",
    "caseDiameter": 40.0,
    "waterResistance": "300m",
    "glassType": "Safira",
    "dialColor": "Preto",
    "braceletMaterial": "Aço",
    "braceletColor": "Prateado",
    "claspType": "Fecho dobrável",
    "gender": "Masculino",
    "seller": {
      "id": 2,
      "name": "Maria Vendedora",
      "email": "maria@example.com"
    }
  }
]
```

---

#### 2. Buscar Relógio por ID
**GET** `/watches/:id`

**Autenticação:** Não requerida

**Resposta (200):** Mesmo formato do objeto de relógio acima

---

#### 3. Criar Relógio
**POST** `/watches`

**Autenticação:** ✅ Requerida

**Content-Type:** `multipart/form-data`

**Body (FormData):**
- `brand` (string, obrigatório)
- `model` (string, obrigatório)
- `price` (number, obrigatório)
- `condition` (string, obrigatório)
- `description` (string, opcional)
- `referenceNumber` (string, opcional)
- `movement` (string, opcional)
- `year` (number, opcional)
- `caseMaterial` (string, opcional)
- `caseDiameter` (number, opcional)
- `waterResistance` (string, opcional)
- `glassType` (string, opcional)
- `dialColor` (string, opcional)
- `braceletMaterial` (string, opcional)
- `braceletColor` (string, opcional)
- `claspType` (string, opcional)
- `gender` (string, opcional)
- `image` (File, opcional)

**Resposta (201):**
```json
{
  "message": "Relógio cadastrado com sucesso!",
  "relogio": {
    "id": 5,
    "brand": "Omega",
    "model": "Speedmaster",
    "price": 45000.00,
    "condition": "Novo",
    "images": ["https://cloudinary.com/..."],
    "sellerId": 2
  }
}
```

---

#### 4. Atualizar Relógio
**PUT** `/watches/:id`

**Autenticação:** ✅ Requerida

**Body:**
```json
{
  "price": 47000,
  "description": "Descrição atualizada"
}
```

**Resposta (200):**
```json
{
  "message": "Relógio atualizado com sucesso!",
  "relogio": {
    "id": 5,
    "price": 47000.00
  }
}
```

---

#### 5. Excluir Relógio
**DELETE** `/watches/:id`

**Autenticação:** ✅ Requerida

**Resposta (200):**
```json
{
  "message": "Relógio excluído com sucesso."
}
```

---

### Pedidos (Orders)

#### 1. Criar Pedido
**POST** `/orders`

**Autenticação:** ✅ Requerida

**Body:**
```json
{
  "watchId": 3
}
```

**Resposta (201):**
```json
{
  "message": "Pedido criado com sucesso!",
  "pedido": {
    "id": 1,
    "buyerId": 1,
    "watchId": 3,
    "status": "pendente",
    "paymentInfo": "",
    "shippingInfo": "",
    "createdAt": "2025-01-20T15:00:00.000Z"
  }
}
```

---

#### 2. Listar Pedidos do Usuário
**GET** `/orders`

**Autenticação:** ✅ Requerida

**Resposta (200):**
```json
[
  {
    "id": 1,
    "buyerId": 1,
    "watchId": 3,
    "status": "pendente",
    "createdAt": "2025-01-20T15:00:00.000Z",
    "watch": {
      "id": 3,
      "brand": "Rolex",
      "model": "Submariner",
      "price": 85000.00,
      "images": ["https://cloudinary.com/..."]
    }
  }
]
```

---

#### 3. Atualizar Status do Pedido
**PUT** `/orders/:id`

**Autenticação:** ✅ Requerida

**Body:**
```json
{
  "status": "Enviado"
}
```

**Resposta (200):**
```json
{
  "message": "Status do pedido atualizado com sucesso!",
  "pedido": {
    "id": 1,
    "status": "Enviado"
  }
}
```

---

#### 4. Criar Checkout (Stripe)
**POST** `/orders/checkout/:orderId`

**Autenticação:** ✅ Requerida

**Resposta (200):**
```json
{
  "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

---

#### 5. Verificar Pagamento
**GET** `/orders/verificar-pagamento?sessionId={sessionId}`

**Autenticação:** ✅ Requerida

**Query Params:**
- `sessionId` (string): ID da sessão Stripe

**Resposta (200):**
```json
{
  "success": true,
  "message": "Pagamento confirmado e pedido atualizado para 'Pago'."
}
```

---

#### 6. Confirmar Entrega
**PUT** `/orders/:id/confirm-delivery`

**Autenticação:** ✅ Requerida (deve ser o comprador)

**Resposta (200):**
```json
{
  "success": true,
  "message": "Entrega confirmada com sucesso.",
  "pedido": {
    "id": 5,
    "status": "Entregue"
  }
}
```

---

#### 7. Realizar Payout
**POST** `/orders/payout/:orderId`

**Autenticação:** ✅ Requerida

**Resposta (200):**
```json
{
  "success": true,
  "message": "Payout realizado com sucesso.",
  "dados": {
    "vendedor": "Maria Vendedora",
    "valor_pago": 85000.00,
    "comissao": 8500.00,
    "valor_recebido": 76500.00
  }
}
```

**Nota:** Taxa de marketplace: 10% do valor

---

### Mensagens

#### 1. Enviar Mensagem
**POST** `/messages`

**Autenticação:** ✅ Requerida

**Body:**
```json
{
  "toUserId": 2,
  "content": "Esse relógio está disponível?",
  "watchId": 3
}
```

**Resposta (201):**
```json
{
  "id": 1,
  "fromUserId": 1,
  "toUserId": 2,
  "watchId": 3,
  "content": "Esse relógio está disponível?",
  "timestamp": "2025-01-20T16:30:00.000Z"
}
```

---

#### 2. Listar Mensagens
**GET** `/messages`

**Autenticação:** ✅ Requerida

**Resposta (200):**
```json
[
  {
    "id": 1,
    "fromUserId": 1,
    "toUserId": 2,
    "watchId": 3,
    "content": "Esse relógio está disponível?",
    "timestamp": "2025-01-20T16:30:00.000Z",
    "fromUser": {
      "id": 1,
      "name": "João Silva",
      "email": "joao@example.com"
    },
    "toUser": {
      "id": 2,
      "name": "Maria Vendedora",
      "email": "maria@example.com"
    },
    "watch": {
      "id": 3,
      "brand": "Rolex",
      "model": "Submariner"
    }
  }
]
```

---

### Coleções

#### 1. Adicionar Relógio à Coleção
**POST** `/collections`

**Autenticação:** ✅ Requerida

**Body:**
```json
{
  "watchId": 5,
  "estimatedValue": 85000
}
```

**Resposta (201):**
```json
{
  "message": "Relógio adicionado à coleção com sucesso.",
  "colecao": {
    "id": 1,
    "userId": 1,
    "watchId": 5,
    "estimatedValue": 85000.00,
    "watch": {
      "id": 5,
      "brand": "Omega",
      "model": "Speedmaster"
    }
  }
}
```

---

#### 2. Listar Coleção do Usuário
**GET** `/collections`

**Autenticação:** ✅ Requerida

**Resposta (200):**
```json
[
  {
    "id": 1,
    "userId": 1,
    "watchId": 5,
    "estimatedValue": 85000.00,
    "watch": {
      "id": 5,
      "brand": "Omega",
      "model": "Speedmaster",
      "price": 45000.00,
      "images": ["https://cloudinary.com/..."]
    }
  }
]
```

---

#### 3. Atualizar Valor Estimado
**PUT** `/collections/:id`

**Autenticação:** ✅ Requerida

**Body:**
```json
{
  "estimatedValue": 92000
}
```

**Resposta (200):**
```json
{
  "message": "Valor estimado atualizado com sucesso.",
  "colecao": {
    "id": 1,
    "estimatedValue": 92000.00
  }
}
```

---

#### 4. Remover Relógio da Coleção
**DELETE** `/collections/:watchId`

**Autenticação:** ✅ Requerida

**Resposta (200):**
```json
{
  "message": "Relógio removido da coleção com sucesso."
}
```

---

### Histórico de Preços

#### 1. Listar Histórico de Preço
**GET** `/price-history/:watchId`

**Autenticação:** ✅ Requerida

**Resposta (200):**
```json
[
  {
    "id": 1,
    "watchModel": "Omega Speedmaster",
    "date": "2025-01-20T14:20:00.000Z",
    "averagePrice": 45000.00,
    "watchId": 5
  },
  {
    "id": 2,
    "watchModel": "Omega Speedmaster",
    "date": "2025-01-22T10:15:00.000Z",
    "averagePrice": 47000.00,
    "watchId": 5
  }
]
```

---

### Administração

**Nota:** Todas as rotas de admin requerem role `ADMIN`

#### 1. Gerar Relatórios do Sistema
**GET** `/admin/reports`

**Autenticação:** ✅ Requerida + ADMIN

**Resposta (200):**
```json
{
  "totalUsuarios": 150,
  "totalRelogios": 75,
  "totalPedidos": 45,
  "totalVendas": 30
}
```

---

#### 2. Listar Logs Administrativos
**GET** `/admin/logs`

**Autenticação:** ✅ Requerida + ADMIN

**Resposta (200):**
```json
[
  {
    "id": 1,
    "action": "Criou novo usuário",
    "userId": 3,
    "timestamp": "2025-01-20T10:00:00.000Z",
    "user": {
      "id": 3,
      "name": "Admin Principal",
      "email": "admin@nobile.com"
    }
  }
]
```

---

## Implementação com Axios

### Instalação
```bash
npm install axios
```

### Configuração Base

```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

### Classe de Serviço

```typescript
// src/services/nobile.service.ts
import api from './api';

class NobileService {
  // AUTENTICAÇÃO
  async register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    country?: string;
    state?: string;
    city?: string;
    role?: 'BUYER' | 'SELLER' | 'ADMIN';
  }) {
    const response = await api.post('/auth/register', data);
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  }

  logout() {
    localStorage.removeItem('token');
  }

  // RELÓGIOS
  async getWatches() {
    const response = await api.get('/watches');
    return response.data;
  }

  async getWatch(id: number) {
    const response = await api.get(`/watches/${id}`);
    return response.data;
  }

  async createWatch(formData: FormData) {
    const response = await api.post('/watches', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async updateWatch(id: number, data: any) {
    const response = await api.put(`/watches/${id}`, data);
    return response.data;
  }

  async deleteWatch(id: number) {
    const response = await api.delete(`/watches/${id}`);
    return response.data;
  }

  // PEDIDOS
  async createOrder(watchId: number) {
    const response = await api.post('/orders', { watchId });
    return response.data;
  }

  async getOrders() {
    const response = await api.get('/orders');
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
    const response = await api.get('/orders/verificar-pagamento', {
      params: { sessionId }
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

  // MENSAGENS
  async sendMessage(data: { toUserId: number; content: string; watchId?: number }) {
    const response = await api.post('/messages', data);
    return response.data;
  }

  async getMessages() {
    const response = await api.get('/messages');
    return response.data;
  }

  // COLEÇÕES
  async addToCollection(watchId: number, estimatedValue?: number) {
    const response = await api.post('/collections', { watchId, estimatedValue });
    return response.data;
  }

  async getCollection() {
    const response = await api.get('/collections');
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

  // HISTÓRICO DE PREÇOS
  async getPriceHistory(watchId: number) {
    const response = await api.get(`/price-history/${watchId}`);
    return response.data;
  }

  // ADMINISTRAÇÃO
  async getReports() {
    const response = await api.get('/admin/reports');
    return response.data;
  }

  async getAdminLogs() {
    const response = await api.get('/admin/logs');
    return response.data;
  }
}

export default new NobileService();
```

---

### Exemplos de Uso

```typescript
import nobileService from './services/nobile.service';

// Login
try {
  const { token, user } = await nobileService.login('joao@example.com', 'senha123');
  console.log('Login bem-sucedido:', user);
} catch (error) {
  console.error('Erro:', error);
}

// Listar relógios
const watches = await nobileService.getWatches();

// Criar relógio com imagem
const formData = new FormData();
formData.append('brand', 'Omega');
formData.append('model', 'Speedmaster');
formData.append('price', '45000');
formData.append('condition', 'Novo');
formData.append('image', fileInput.files[0]);

const result = await nobileService.createWatch(formData);

// Criar pedido
const order = await nobileService.createOrder(3);

// Criar checkout e redirecionar
const { checkoutUrl } = await nobileService.createCheckout(order.pedido.id);
window.location.href = checkoutUrl;

// Enviar mensagem
await nobileService.sendMessage({
  toUserId: 2,
  content: 'Esse relógio está disponível?',
  watchId: 3
});

// Adicionar à coleção
await nobileService.addToCollection(5, 85000);

// Obter relatórios (admin)
const reports = await nobileService.getReports();
```

---

## TypeScript Interfaces

```typescript
export type Role = 'BUYER' | 'SELLER' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
  role: Role;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Watch {
  id: number;
  brand: string;
  model: string;
  referenceNumber?: string;
  movement?: string;
  year?: number;
  condition: string;
  price: number;
  description?: string;
  images: string[];
  sellerId: number;
  createdAt: string;
  updatedAt: string;
  caseMaterial?: string;
  caseDiameter?: number;
  waterResistance?: string;
  glassType?: string;
  dialColor?: string;
  braceletMaterial?: string;
  braceletColor?: string;
  claspType?: string;
  gender?: string;
  seller?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface Order {
  id: number;
  buyerId: number;
  watchId: number;
  status: string;
  paymentInfo?: string;
  shippingInfo?: string;
  createdAt: string;
  buyer?: User;
  watch?: Watch;
}

export interface Message {
  id: number;
  fromUserId: number;
  toUserId: number;
  watchId?: number;
  content: string;
  timestamp: string;
  fromUser?: {
    id: number;
    name: string;
    email: string;
  };
  toUser?: {
    id: number;
    name: string;
    email: string;
  };
  watch?: Watch;
}

export interface Collection {
  id: number;
  userId: number;
  watchId: number;
  estimatedValue?: number;
  user?: User;
  watch?: Watch;
}

export interface PriceHistory {
  id: number;
  watchModel: string;
  date: string;
  averagePrice: number;
  watchId?: number;
}

export interface AdminLog {
  id: number;
  action: string;
  userId: number;
  timestamp: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}
```

---

## Códigos de Status HTTP

- `200`: Sucesso
- `201`: Criado com sucesso
- `400`: Dados inválidos
- `401`: Não autenticado (token ausente ou inválido)
- `403`: Não autorizado (sem permissão)
- `404`: Recurso não encontrado
- `500`: Erro interno do servidor

---

## Swagger

Documentação interativa disponível em:
```
http://localhost:3000/api-docs
```
