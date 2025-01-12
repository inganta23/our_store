import { Product } from '@/types';
import { create } from 'zustand';

interface ProductsState {
  products: Product[];
  page: number;
  setProducts: (newProducts: Product[]) => void;
  setPage: (newPage: number) => void;
}

const useProductsStore = create<ProductsState>((set) => ({
  products: [],
  page: 0,
  setProducts: (newProducts) => set({ products: newProducts }),
  setPage: (newPage) => set({ page: newPage }),
}));

export default useProductsStore;

// setProducts: (newProducts) => {
//   const uniqueProducts = newProducts.reduce((acc: Product[], product) => {
//     if (!acc.some((p: Product) => p.sku === product.sku)) {
//       acc.push(product);
//     }
//     return acc;
//   }, []);

//   set({ products: uniqueProducts });
// },
