import { ShippingAddress, ShippingMethod } from "@/types/cart";

/**
 * Endereços mockados para desenvolvimento
 */
export const MOCK_ADDRESSES: ShippingAddress[] = [
  {
    id: "addr-1",
    street: "Rua Ernesto Dorneles",
    number: "108",
    complement: "Apto 202",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    zipCode: "837437-030",
    country: "Brasil",
    isDefault: true,
  },
  {
    id: "addr-2",
    street: "8364 Stewart Street",
    number: "Bay Beach",
    complement: "",
    neighborhood: "",
    city: "California",
    state: "CA",
    zipCode: "837437",
    country: "Estados Unidos",
    isDefault: false,
  },
];

/**
 * Métodos de envio mockados
 */
export const MOCK_SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "shipping-1",
    name: "Fedex Delivery",
    carrier: "Fedex",
    deliveryTime: "1-2 Semanas",
    price: 231,
  },
  {
    id: "shipping-2",
    name: "Jadlog Delivery",
    carrier: "Jadlog",
    deliveryTime: "4-5 Semanas",
    price: 245,
  },
];

/**
 * Código PIX mockado
 */
export const MOCK_PIX_CODE =
  "00020126360014BR.GOV.BCB.PIX0114loja@exemplo.com02 12Pagamento1235204000053039865405100.005802BR5920Relogios de Luxo Ltda6009Sao Paulo62070503***6304B13A";

/**
 * QR Code PIX mockado (base64 ou URL)
 */
export const MOCK_PIX_QR_CODE_URL = "/images/mock/qrcode-pix.svg";

/**
 * Código de barras do boleto mockado
 */
export const MOCK_BOLETO_CODE = "32819493020 4573458-2";

/**
 * URL do código de barras mockado
 */
export const MOCK_BOLETO_BARCODE_URL = "/images/mock/barcode-boleto.svg";
