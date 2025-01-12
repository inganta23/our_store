export interface Product {
  title: string;
  sku: string;
  image: string;
  price: number;
  stock: number;
  description: string;
}

export interface AdjustmentTransaction {
  id: string;
  sku: string;
  title: string;
  qty: string;
  amount: number;
  created_at: string;
}

export interface SampleArrowProps {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}
