'use client';

import { Product } from '@/types';
import {
  Card,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { ProductDialog } from './product-dialog';
import useProductsStore from '@/hooks/useProductStore';
import { deleteProduct, fetchProducts } from '@/actions/products';
import { Spinner } from './ui/spinner';
import { useInView } from 'react-intersection-observer';
import { Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { ConfirmationDialog } from './confirmation-dialog';
import { useToast } from '@/hooks/use-toast';
import { Searchbar } from './searchbar';
import { useRouter, useSearchParams } from 'next/navigation';
import { delay, removeQueryParam } from '@/helper';

export interface ProductProps {
  products: Product[] | null;
}

export function Products() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [search, setSearch] = useState('');

  const [isSpinner, setIsSpinner] = useState(true);
  const { ref, inView } = useInView();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const products = useProductsStore((state) => state.products);
  const page = useProductsStore((state) => state.page);
  const setProducts = useProductsStore((state) => state.setProducts);
  const setPage = useProductsStore((state) => state.setPage);

  const openDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const loadAllData = async (searchParam?: string, limit?: number) => {
    limit = limit ?? page * 8;
    searchParam = search ?? search;
    try {
      const fetchedData = await fetchProducts(1, limit, searchParam);
      setProducts(fetchedData ?? []);
    } catch (error) {
      console.error('Error loading all product:', error);
      toast({
        variant: 'destructive',
        title: 'An error occurred while loading all product.',
        description: 'Please contact your administrator.',
      });
    }
  };

  const closeDialog = async () => {
    setIsDialogOpen(false);
    await loadAllData();
    setSelectedProduct(null);
  };

  const closeDeleteDialog = async () => {
    setIsDeleteDialogOpen(false);
    await delay(30);
    await loadAllData();
    setProductToDelete(null);
  };

  const handleDelete = async () => {
    if (!productToDelete?.sku) return;

    try {
      const response = await deleteProduct(productToDelete.sku);

      if (response.success) {
        await loadAllData();
        toast({
          description: 'Product deleted successfully!',
        });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        variant: 'destructive',
        title: 'An error occurred while deleting the product.',
        description: 'Please contact your administrator.',
      });
    } finally {
      closeDeleteDialog();
    }
  };

  const loadMore = async (pageNum: number, searchParam?: string) => {
    if (isLoading) return;
    setIsLoading(true);
    searchParam = searchParam ?? '';
    try {
      await delay(200);
      const nextPage = pageNum + 1;
      const newProducts = (await fetchProducts(nextPage, 8, searchParam)) ?? [];
      if (newProducts.length === 0) {
        setIsSpinner(false);
        setIsLoading(false);
        return;
      }

      setProducts([...products, ...newProducts]);
      setPage(nextPage);
    } catch (error) {
      console.error('Error load products: ', error);
      toast({
        variant: 'destructive',
        title: 'Failed to load product',
        description: 'Please contact your administrator.',
      });
      setIsSpinner(false);
    }
    setIsLoading(false);
  };

  const handleSearch = async (query: string) => {
    setProducts([]);
    setPage(0);
    if (query === '') {
      const searchparams = removeQueryParam('search');
      router.push(`${window.location.pathname}?${searchparams.toString()}`, {
        scroll: false,
      });
      return;
    }

    router.push(`?search=${query}`, { scroll: false });
  };

  useEffect(() => {
    if (inView && page > 0) {
      loadMore(page, search);
    }
  }, [inView]);

  useEffect(() => {
    setIsSpinner(true);
    setPage(0);
    setProducts([]);

    const searchParam = searchParams.get('search') as string;
    loadMore(0, searchParam);
    setSearch(searchParam);
    return () => {
      setPage(0);
      setProducts([]);
    };
  }, [searchParams]);

  return (
    <div className="flex flex-col justify-center items-center gap-5">
      <Searchbar
        placeholder="Search by sku or title"
        onSearch={(query) => handleSearch(query)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products ? (
          products.map((product) => (
            <div className="relative group" key={product.sku}>
              <Card
                className="cursor-pointer hover:bg-gray-200 transition duration-300 ease-in-out h-96 overflow-hidden"
                onClick={() => openDialog(product)}
              >
                <CardContent className="flex flex-col items-center justify-center p-4">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="object-contain h-48 rounded"
                  />
                </CardContent>
                <CardFooter className="text-center flex flex-col p-4">
                  <CardTitle className="my-2">{product.title}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardFooter>
              </Card>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-14 h-12">
                <Button
                  onClick={() => {
                    setProductToDelete(product);
                    setIsDeleteDialogOpen(true);
                  }}
                  className="bg-slate-700 w-full h-full"
                >
                  <Trash2 className="text-red-600" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-xl font-bold">No products available !!</div>
        )}
      </div>

      <ProductDialog
        isOpen={isDialogOpen}
        onClose={closeDialog}
        product={selectedProduct}
      />

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.title}"? This action cannot be undone.`}
      />

      {isSpinner && (
        <div
          className="flex justify-center items-center p-4 col-span-1 sm:col-span-2 md:col-span-3"
          ref={ref}
        >
          <Spinner />
        </div>
      )}
    </div>
  );
}
