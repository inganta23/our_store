'use client';

import { AdjustmentTransaction } from '@/types';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHeader, TableRow } from './ui/table';
import { useEffect, useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ConfirmationDialog } from './confirmation-dialog';
import Pagination from './pagination';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  createTransaction,
  deleteTransaction,
  editTransaction,
  fetchTransactions,
} from '@/actions/transactions';
import { Searchbar } from './searchbar';
import { delay, removeQueryParam } from '@/helper';
import { Spinner } from './ui/spinner';

export function AdjustmentTransactions() {
  const [transactions, setTransactions] = useState<AdjustmentTransaction[]>([]);
  const [editingTransaction, setEditingTransaction] =
    useState<AdjustmentTransaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [newTransaction, setNewTransaction] = useState<{
    sku: string;
    qty: string;
  }>({ sku: '', qty: '' });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] =
    useState<AdjustmentTransaction | null>(null);
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const closeDeleteDialog = async () => {
    setIsDeleteDialogOpen(false);
    await delay(30);
    setTransactionToDelete(null);
  };

  const fetchTransaction = async (page: number, search?: string) => {
    if (isLoading) return;
    setIsLoading(true);
    search = search ?? '';
    try {
      const response = await fetchTransactions(page, search);
      setTransactions(response?.data || []);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching transactions :', error);
      toast({
        title: 'Error fetching transactions.',
        description: 'Please contact your administrator.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const handleAddTransaction = async () => {
    try {
      const response = await createTransaction(newTransaction);

      if (response.success) {
        setNewTransaction({ sku: '', qty: '' });
        fetchTransaction(currentPage);
        toast({ title: 'Transaction added successfully!' });
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: 'Error adding transaction.',
        description: 'Please contact your administrator.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTransaction = async () => {
    if (!transactionToDelete?.id) return null;

    try {
      const response = await deleteTransaction(transactionToDelete.id);

      if (response.success) {
        fetchTransaction(currentPage);
        closeDeleteDialog();
        toast({ title: 'Transaction deleted successfully!' });
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: 'Error deleting transaction.',
        description: 'Please contact your administrator.',
        variant: 'destructive',
      });
    }
  };

  const handleEditTransaction = async () => {
    if (!editingTransaction) return;

    try {
      const response = await editTransaction(editingTransaction);
      console.log(response);
      if (response.success) {
        setEditingTransaction(null);
        fetchTransaction(currentPage);
        toast({ title: 'Transaction edited successfully!' });
      }
    } catch (error) {
      console.error('Error editing transaction:', error);
      toast({
        title: 'Error editing transaction.',
        description: 'Please contact your administrator.',
        variant: 'destructive',
      });
    }
  };

  const handleSearch = async (query: string) => {
    if (query === '') {
      const searchparams = removeQueryParam('search');
      router.push(`${window.location.pathname}?${searchparams.toString()}`, {
        scroll: false,
      });
      return;
    }
    router.push(`?page=${1}&search=${query}`, { scroll: false });
  };

  useEffect(() => {
    fetchTransaction(currentPage, search);
  }, [currentPage, search]);

  useEffect(() => {
    if (searchParams.get('page') !== null) {
      setCurrentPage(parseInt(searchParams.get('page') as string));
    }
    setSearch(searchParams.get('search') as string);
  }, [searchParams]);

  return (
    <div className="p-4">
      <div className="flex flex-wrap justify-between items-center">
        <div className="lg:w-1/3 md:w-1/2 w-full p-4">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Add Adjustment Transactions
          </h2>
          <div className="flex flex-col space-y-4">
            <div>
              <Label htmlFor="sku" className="mb-1 block">
                SKU
              </Label>
              <Input
                id="sku"
                type="text"
                placeholder="Enter SKU"
                value={newTransaction.sku}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, sku: e.target.value })
                }
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="quantity" className="mb-1 block">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="text"
                placeholder="Enter Quantity"
                value={newTransaction.qty}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^-?\d*$/.test(value) || value === '-') {
                    setNewTransaction({
                      ...newTransaction,
                      qty: value,
                    });
                  }
                }}
                className="w-full"
              />
            </div>
            <Button
              onClick={handleAddTransaction}
              className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700"
            >
              Add Adjustment
            </Button>
          </div>
        </div>

        <div className="lg:w-1/3 md:w-1/2 w-full p-4">
          {editingTransaction && (
            <div className="flex flex-col gap-4 w-full">
              <h2 className="text-xl font-semibold">Edit Transaction</h2>
              <div>
                <Label htmlFor="sku" className="mb-1 block">
                  SKU
                </Label>
                <Input
                  type="text"
                  placeholder="SKU"
                  value={editingTransaction.sku}
                  onChange={(e) =>
                    setEditingTransaction({
                      ...editingTransaction,
                      sku: e.target.value,
                    })
                  }
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="quantity" className="mb-1 block">
                  Quantity
                </Label>
                <Input
                  type="text"
                  placeholder="Quantity"
                  value={editingTransaction.qty}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^-?\d*$/.test(value) || value === '-') {
                      setEditingTransaction({
                        ...editingTransaction,
                        qty: value,
                      });
                    }
                  }}
                  className="w-full"
                />
              </div>

              <div className="mt-2 flex space-x-2">
                <Button onClick={handleEditTransaction}>Save Changes</Button>
                <Button
                  onClick={() => setEditingTransaction(null)}
                  variant="secondary"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="my-10">
        <Searchbar
          placeholder="Search by sku or title"
          onSearch={(query) => handleSearch(query)}
        />
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 mt-4">
          List Adjustment Transactions
        </h2>
        {isLoading ? (
          <div className="flex justify-center items-center p-4 col-span-1 sm:col-span-2 md:col-span-3">
            <Spinner />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>No</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {transactions.map((transaction, index) => (
                <TableRow key={transaction.id}>
                  <TableCell>{index + 1 + 10 * (currentPage - 1)}</TableCell>
                  <TableCell>{transaction.sku}</TableCell>
                  <TableCell>{transaction.title}</TableCell>
                  <TableCell>{transaction.qty}</TableCell>
                  <TableCell>{transaction.amount}</TableCell>
                  <TableCell>
                    {new Date(transaction.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <Button
                        onClick={() => {
                          setEditingTransaction(transaction);

                          window.scrollTo({
                            top: 0,
                            behavior: 'smooth',
                          });
                        }}
                        className="w-full sm:w-auto"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => {
                          setTransactionToDelete(transaction);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="w-full sm:w-auto"
                        variant="destructive"
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteTransaction}
        title="Delete Product"
        message={`Are you sure you want to delete this transaction? This action cannot be undone.`}
      />
    </div>
  );
}
