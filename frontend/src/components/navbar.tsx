'use client';

import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { importProducts } from '@/actions/products';
import { Spinner } from './ui/spinner';

export function Navbar() {
  const [isClick, setIsClick] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const toggleNavbar = () => {
    setIsClick(!isClick);
  };

  const handleImport = async () => {
    setIsLoading(true);
    try {
      await importProducts();
      toast({
        title: 'Product imported successfully',
      });
      window.location.reload();
    } catch (error) {
      console.error('Error importing product:', error);
      toast({
        variant: 'destructive',
        title: 'An error occurred while importing the product.',
        description: 'Please contact your administrator.',
      });
      setIsLoading(false);
    }
  };

  return (
    <>
      <nav className="bg-black fixed top-0 left-0 w-full z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link href="/" className="text-white">
                  Our Store
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center space-x-4">
                <Link
                  href="/products"
                  className="text-white hover:bg-white hover:text-black rounded-lg p-2"
                >
                  Products
                </Link>
                <Link
                  href="/transactions"
                  className="text-white hover:bg-white hover:text-black rounded-lg p-2"
                >
                  Transactions
                </Link>
                <Button
                  className="bg-white text-black hover:bg-gray-500 shadow-md rounded-lg px-4 py-2 transition duration-300 ease-in-out font-bold"
                  onClick={handleImport}
                >
                  {isLoading ? <Spinner /> : 'Import Products'}
                </Button>
              </div>
            </div>
            <div className="md:hidden flex items-center">
              <button
                className="inline-flex items-center justify-center p-2 rounded-md text-white md:text-white
              hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={toggleNavbar}
              >
                {isClick ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
        {isClick && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                href="/products"
                className="text-white hover:bg-white block hover:text-black rounded-lg p-2"
              >
                Products
              </Link>
              <Link
                href="/transactions"
                className="text-white hover:bg-white block hover:text-black rounded-lg p-2"
              >
                Transactions
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
