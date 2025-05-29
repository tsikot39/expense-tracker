"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';

interface Category {
  _id: string;
  name: string;
  color: string;
  icon?: string;
}

export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/categories');

        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }

        const data = await response.json();
        setCategories(data);
      } catch (err) {
        setError('Error loading categories. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleDeleteClick = (id: string) => {
    setCategoryToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/categories/${categoryToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete category');
      }

      // Remove the deleted category from the state
      setCategories(categories.filter(category => category._id !== categoryToDelete));

      // Close the modal and reset state
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (err) {
      console.error('Error deleting category:', err);
      // We'll handle errors in the UI rather than with an alert
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <p>Loading categories...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <p className="text-red-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Categories</CardTitle>
          <Button asChild size="sm">
            <Link href="/categories/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="flex justify-center items-center h-40 flex-col gap-4">
              <p>No categories found.</p>
              <p className="text-sm text-muted-foreground">
                Click the "Add Category" button to create your first category.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Color</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell>
                      <div 
                        className="w-6 h-6 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/categories/${category._id}/edit`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteClick(category._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone and will remove all associated data."
        itemName={categoryToDelete ? categories.find(c => c._id === categoryToDelete)?.name : ''}
        isDeleting={isDeleting}
      />
    </>
  );
}
