'use client';

import { Dialog, DialogContent } from './ui/dialog';
import { Button } from '@/components/ui/button';
import { DialogTitle } from '@radix-ui/react-dialog';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: ConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full p-4">
        <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
        <p className="mt-2">{message}</p>
        <div className="flex justify-end mt-4">
          <Button onClick={onClose} className="mr-2">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
