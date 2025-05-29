"use client";

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  itemName?: string;
  isDeleting?: boolean;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  isDeleting = false,
}: DeleteConfirmationModalProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>
            {description}
            {itemName && <span className="font-medium"> "{itemName}"</span>}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full"></span>
                Deleting...
              </span>
            ) : (
              'Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}