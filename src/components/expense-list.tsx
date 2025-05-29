"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Category {
  _id: string;
  name: string;
  color?: string;
}

interface Expense {
  _id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  categoryName?: string;
  categoryColor?: string;
  description?: string;
}

interface ExpenseListProps {
  title?: string;
  limit?: number;
  showPagination?: boolean;
}

export function ExpenseList({ title = "Recent Expenses", limit, showPagination = false }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Category filter state
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = limit || 10; // Use limit as page size if provided, otherwise default to 10

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsCategoriesLoading(true);
        const response = await fetch('/api/categories');

        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }

        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // We don't set an error state here as it would override the expenses error
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch expenses when dependencies change
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setIsLoading(true);

        // Build URL with pagination parameters
        let url = '/api/expenses';
        const params = new URLSearchParams();

        if (showPagination) {
          params.append('page', currentPage.toString());
          params.append('pageSize', pageSize.toString());
        } else if (limit) {
          params.append('limit', limit.toString());
        }

        // Add category filter if selected
        if (selectedCategory) {
          params.append('category', selectedCategory);
        }

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch expenses');
        }

        const result = await response.json();

        if (showPagination && result.pagination) {
          setExpenses(result.data);
          setTotalPages(result.pagination.totalPages);
          setTotalItems(result.pagination.totalItems);
        } else {
          setExpenses(result);
        }
      } catch (err) {
        setError('Error loading expenses. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, [limit, currentPage, pageSize, showPagination, selectedCategory]);

  const handleDeleteClick = (id: string) => {
    setExpenseToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!expenseToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/expenses/${expenseToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }

      // Remove the deleted expense from the state
      const updatedExpenses = expenses.filter(expense => expense._id !== expenseToDelete);
      setExpenses(updatedExpenses);

      // If we're on the last page and it's now empty, go to the previous page
      if (showPagination && updatedExpenses.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }

      // Close the modal and reset state
      setIsDeleteModalOpen(false);
      setExpenseToDelete(null);
    } catch (err) {
      console.error('Error deleting expense:', err);
      // We'll handle errors in the UI rather than with an alert
    } finally {
      setIsDeleting(false);
    }
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Category filter handlers
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Reset to first page when filter changes
    setCurrentPage(1);
  };

  const clearCategoryFilter = () => {
    setSelectedCategory(null);
    // Reset to first page when filter is cleared
    setCurrentPage(1);
  };

  // Render the category filter UI
  const renderCategoryFilter = () => {
    return (
      <div className="flex items-center gap-2 mt-2 relative z-20">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filter by category:</span>
        </div>

        {selectedCategory ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs">
              {categories.find(c => c._id === selectedCategory)?.name || 'Unknown'}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 rounded-full hover:bg-primary/20" 
                onClick={clearCategoryFilter}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Clear filter</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative inline-block">
            <Select 
              key={`category-select-${selectedCategory || "default"}`}
              onValueChange={handleCategoryChange} 
              defaultValue={selectedCategory || ""}
              value={selectedCategory || ""}
            >
              <SelectTrigger className="w-[180px] h-8 cursor-pointer bg-secondary text-secondary-foreground border-border">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent sideOffset={4} align="start" className="z-[100] bg-secondary text-secondary-foreground border-border">
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: category.color || '#CCCCCC' }}
                      />
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <p>Loading expenses...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <p className="text-red-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (expenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {categories.length > 0 && renderCategoryFilter()}
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40 flex-col gap-4">
            <p>No expenses found.</p>
            {selectedCategory ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearCategoryFilter}
                className="mt-2"
              >
                <X className="mr-2 h-4 w-4" />
                Clear filter
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Click the "Add Expense" button in the header to create your first expense.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {categories.length > 0 && renderCategoryFilter()}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense._id}>
                  <TableCell className="font-medium">{expense.title}</TableCell>
                  <TableCell>{formatDate(new Date(expense.date))}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {expense.categoryColor && (
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: expense.categoryColor }}
                        />
                      )}
                      {expense.categoryName || expense.category}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/expenses/${expense._id}/edit`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteClick(expense._id)}
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
        </CardContent>

        {/* Pagination controls */}
        {showPagination && totalPages > 1 && (
          <CardFooter className="flex items-center justify-between px-6 py-4 border-t relative z-10">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{expenses.length}</span> of{" "}
              <span className="font-medium">{totalItems}</span> expenses
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 cursor-pointer bg-secondary text-secondary-foreground border-border"
                type="button"
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center text-sm font-medium">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 cursor-pointer bg-secondary text-secondary-foreground border-border"
                type="button"
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setExpenseToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
        itemName={expenseToDelete ? expenses.find(e => e._id === expenseToDelete)?.title : ''}
        isDeleting={isDeleting}
      />
    </>
  );
}
