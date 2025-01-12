'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Slider from 'react-slick';
import { ArrowLeftCircle } from 'lucide-react';
import { ArrowRightCircle } from 'lucide-react';
import useProductsStore from '@/hooks/useProductStore';
import { fetchProducts } from '@/actions/products';
import { AddProductDialog } from './add-product-dialog';
import { useToast } from '@/hooks/use-toast';
import { SampleArrowProps } from '@/types';

const SampleNextArrow = (props: SampleArrowProps) => {
  const { className, style, onClick } = props;
  return (
    <ArrowRightCircle
      className={className}
      style={{ ...style, display: 'block', color: 'black' }}
      onClick={onClick}
    />
  );
};

const SamplePrevArrow = (props: SampleArrowProps) => {
  const { className, style, onClick } = props;
  return (
    <ArrowLeftCircle
      className={className}
      style={{ ...style, display: 'block', color: 'black' }}
      onClick={onClick}
    />
  );
};

export function BannerProduct() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const setProducts = useProductsStore((state) => state.setProducts);
  const page = useProductsStore((state) => state.page);
  const { toast } = useToast();

  const closeDialog = async () => {
    setIsDialogOpen(false);
    loadAllData();
  };

  const settings = {
    arrows: true,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
  };

  const loadAllData = async () => {
    try {
      const fetchedData = await fetchProducts(1, page * 8);
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

  return (
    <>
      <div className="relative w-full h-96">
        <Slider {...settings}>
          <div className="h-96">
            <img
              src={
                'https://plus.unsplash.com/premium_photo-1667912925305-629794bdb691?q=80&w=2021&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
              }
              alt="Banner 1"
              className="object-cover w-full h-full"
            />
          </div>
          <div className="h-96">
            <img
              src={
                'https://images.unsplash.com/photo-1496661415325-ef852f9e8e7c?q=80&w=1854&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
              }
              alt="Banner 2"
              className="object-cover w-full h-full"
            />
          </div>
        </Slider>
        <div className="absolute inset-0 bg-black opacity-50" />
        <div className="absolute left-10 top-1/2 transform -translate-y-1/2 text-white">
          <h1 className="text-4xl font-bold">Welcome to Our Store</h1>
          <p className="mt-2 text-lg">Discover the latest products today!</p>
          <Button
            className="mt-4 bg-blue-600 hover:bg-blue-700 transition duration-300"
            onClick={() => setIsDialogOpen(true)}
          >
            Add New Product
          </Button>
        </div>
      </div>

      <AddProductDialog isOpen={isDialogOpen} onClose={closeDialog} />
    </>
  );
}
