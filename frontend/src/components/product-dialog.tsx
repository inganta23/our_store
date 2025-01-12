'use client';

import { Dialog, DialogContent } from './ui/dialog';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { DialogTitle } from '@radix-ui/react-dialog';
import { Switch } from './ui/switch';
import { useEffect, useState } from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';

interface ProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export function ProductDialog({
  isOpen,
  onClose,
  product,
}: ProductDialogProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedProduct, setEditedProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (editedProduct) {
      setEditedProduct({
        ...editedProduct,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedProduct),
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        setEditedProduct(updatedProduct);
        toast({
          description: 'Product updated successfully!',
        });
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: 'Failed updating product',
        description:
          'An error occurred while updating the product. Please contact your administrator.',
        variant: 'destructive',
      });
    }
    closeModal();
  };

  const closeModal = () => {
    setIsEditMode(false);
    onClose();
  };

  useEffect(() => {
    if (isOpen && product) {
      setEditedProduct(product);
    }
  }, [isOpen, product]);

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="max-w-3xl w-full p-4 bg-gray-100">
        <DialogTitle className="text-xl font-bold">Detail</DialogTitle>

        <div className="flex items-center mb-4">
          <Switch checked={isEditMode} onCheckedChange={setIsEditMode} />
          <span className="ml-2">{isEditMode ? 'Edit Mode' : 'View Mode'}</span>
        </div>

        <div className="flex flex-col justify-center items-center md:flex-row md:space-x-4">
          <img
            src={product.image}
            alt={product.title}
            className="object-contain h-48 w-full md:w-1/2 rounded"
          />
          <div className="p-4 flex flex-col justify-between w-full md:w-1/2 gap-2">
            <Label>
              SKU
              <Input
                type="text"
                name="sku"
                value={product.sku}
                disabled
                className="border rounded p-1 w-full"
              />
            </Label>
            <Label>
              Title
              <Input
                type="text"
                name="title"
                value={isEditMode ? editedProduct?.title : product.title}
                onChange={handleChange}
                disabled={!isEditMode}
                className="border rounded p-1 w-full"
              />
            </Label>
            <Label>
              Stock
              <Input
                type="text"
                name="stock"
                value={product.stock}
                disabled
                className="border rounded p-1 w-full"
              />
            </Label>
            <Label>
              Price
              <Input
                type="number"
                name="price"
                value={isEditMode ? editedProduct?.price : product.price}
                onChange={handleChange}
                disabled={!isEditMode}
                className="border rounded p-1 w-full"
                min={0}
              />
            </Label>
            <Label>
              Description:
              <textarea
                name="description"
                value={
                  isEditMode ? editedProduct?.description : product.description
                }
                onChange={handleChange}
                disabled={!isEditMode}
                className="border rounded p-1 w-full"
              />
            </Label>
            <Label>
              Image URL
              <Input
                type="text"
                name="image"
                value={isEditMode ? editedProduct?.image : product.image}
                onChange={handleChange}
                disabled={!isEditMode}
                className="border rounded p-1 w-full"
              />
            </Label>
            <Button
              onClick={isEditMode ? handleSubmit : onClose}
              className="mt-4"
            >
              {isEditMode ? 'Submit' : 'Close'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
