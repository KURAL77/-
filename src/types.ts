export interface MenuItem {
  id: string;
  name: string;
  russianName: string;
  description: string;
  price: number;
  category: "main" | "dumpling" | "side" | "drink" | "dessert";
  image: string;
  isPopular?: boolean;
}

export interface Table {
  id: number;
  name: string;
  capacity: number;
  type: "standard" | "vip" | "booth" | "topchan";
  description: string;
}

export interface TableBooking {
  id?: string;
  name: string;
  phone: string;
  tableId: number;
  date: string;
  time: string;
  guests: number;
  status?: string;
  createdAt?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface FoodOrder {
  id?: string;
  customerName: string;
  phone: string;
  items: OrderItem[];
  totalPrice: number;
  address: string;
  status?: string;
  createdAt?: string;
}

export interface Review {
  id?: string;
  name: string;
  rating: number;
  comment: string;
  date?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
}
