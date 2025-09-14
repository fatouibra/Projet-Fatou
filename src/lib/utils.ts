import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
  }).format(price);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `MNU-${timestamp}${randomStr}`.toUpperCase();
}

export function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    RECEIVED: "Reçue",
    PREPARING: "En préparation",
    READY: "Prête",
    DELIVERING: "En livraison",
    DELIVERED: "Livrée",
    CANCELLED: "Annulée",
  };
  return statusMap[status] || status;
}

export function getDeliveryTypeText(type: string): string {
  const typeMap: Record<string, string> = {
    DELIVERY: "Livraison",
    PICKUP: "À emporter",
  };
  return typeMap[type] || type;
}

export function getEstimatedTime(status: string): string {
  const timeMap: Record<string, string> = {
    RECEIVED: "5-10 min",
    PREPARING: "15-25 min",
    READY: "5 min",
    DELIVERING: "20-30 min",
    DELIVERED: "Livrée",
    CANCELLED: "-",
  };
  return timeMap[status] || "-";
}
