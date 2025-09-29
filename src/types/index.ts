export interface Customer {
  id: string;
  name: string;
  phone?: string;
  totalDebt: number;
  created_at?: string;
}

export interface Transaction {
  id: string;
  customer_id: string;
  amount: number;
  items: string;
  date: string;
  type: 'debt' | 'payment';
  created_at?: string;
}