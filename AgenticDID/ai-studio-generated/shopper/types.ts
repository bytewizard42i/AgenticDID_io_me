/**
 * AI Studio Generated - Shopper Agent
 * Type Definitions
 */

import { ReactNode } from 'react';

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export enum OrderStatus {
  PLACED = 'Order Placed',
  PROCESSING = 'Processing',
  SHIPPED = 'Shipped',
  OUT_FOR_DELIVERY = 'Out for Delivery',
  DELIVERED = 'Delivered',
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  date: Date;
}

export type MessageRole = 'user' | 'agent';

export interface Message {
  id: string;
  role: MessageRole;
  content: ReactNode;
  timestamp: Date;
}
