export interface CreateTransaction {
  sku: string;
  qty: number;
}

export interface UpdateTransaction extends CreateTransaction {
  id: number;
}

export interface Stock {
  stock: number;
}
