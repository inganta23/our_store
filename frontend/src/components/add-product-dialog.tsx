'use client';

import { createProduct } from '@/actions/products';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { DialogTitle } from '@radix-ui/react-dialog';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface AddProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddProductDialog({ isOpen, onClose }: AddProductDialogProps) {
  const [newProduct, setNewProduct] = useState<Product>({
    title: '',
    stock: 0,
    price: 0,
    description: '',
    image: '',
    sku: '',
  });

  const { toast } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setNewProduct({
      ...newProduct,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await createProduct(newProduct);

      if (response.success) {
        setNewProduct({
          title: '',
          stock: 0,
          price: 0,
          description: '',
          image: '',
          sku: '',
        });
        toast({
          description: 'Product created successfully!',
        });
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        variant: 'destructive',
        title: 'An error occurred while creating product.',
        description: 'Please contact your administrator.',
      });
    }
    closeModal();
  };

  const closeModal = () => {
    setNewProduct({
      title: '',
      stock: 0,
      price: 0,
      description: '',
      image: '',
      sku: '',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="max-w-3xl w-full p-4">
        <DialogTitle className="text-xl font-bold">Add New Product</DialogTitle>

        <div className="flex flex-col md:flex-row md:space-x-4 justify-center items-center">
          <img
            src={newProduct.image === '' ? undefined : newProduct.image}
            alt={newProduct.title}
            className="object-contain h-48 w-full md:w-1/2 rounded"
          />

          <div className="p-4 flex flex-col justify-between w-full md:w-1/2 gap-2">
            <Label>
              SKU
              <Input
                type="text"
                name="sku"
                value={newProduct.sku}
                onChange={handleChange}
                className="border rounded p-1 w-full"
              />
            </Label>
            <Label>
              Title
              <Input
                type="text"
                name="title"
                value={newProduct.title}
                onChange={handleChange}
                className="border rounded p-1 w-full"
              />
            </Label>
            <Label>
              Price
              <Input
                type="number"
                name="price"
                value={newProduct.price}
                onChange={handleChange}
                className="border rounded p-1 w-full"
                min={0}
              />
            </Label>
            <Label>
              Description:
              <Textarea
                name="description"
                value={newProduct.description}
                onChange={handleChange}
                className="border rounded p-1 w-full"
              />
            </Label>
            <Label>
              Image URL
              <Input
                type="text"
                name="image"
                value={newProduct.image}
                onChange={handleChange}
                className="border rounded p-1 w-full"
              />
            </Label>
            <Button onClick={handleSubmit}>Submit</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
