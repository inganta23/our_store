'use server';

import { AdjustmentTransaction } from '@/types';

const BASE_URL = `${process.env.API_URL}/api/transactions`;

async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorMessage = await response
      .text()
      .catch(() => 'Unknown error occurred');
    throw new Error(`HTTP ${response.status}: ${errorMessage}`);
  }
  try {
    return await response.json();
  } catch {
    throw new Error('Failed to parse response JSON');
  }
}

export async function fetchTransactions(
  page: number,
  search?: string,
  limit?: number,
) {
  limit = limit ?? 10;
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search ? { search } : {}),
  });

  try {
    const response = await fetch(`${BASE_URL}?${params}`);
    const data = await handleResponse(response);
    return {
      data: data.data as AdjustmentTransaction[],
      totalPages: data.totalPages,
    };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Fetch Transactions Error: ${errorMessage}`);
  }
}

export async function createTransaction(newTransaction: {
  sku: string;
  qty: string;
}) {
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTransaction),
    });
    await handleResponse(response);
    return { success: true };
  } catch (error) {
    console.error('Error creating transaction:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Create Transaction Error: ${errorMessage}`);
  }
}

export async function deleteTransaction(id: string) {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
    await handleResponse(response);
    return { success: true };
  } catch (error) {
    console.error('Error deleting transaction:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Delete Transaction Error: ${errorMessage}`);
  }
}

export async function editTransaction(
  editingTransaction: AdjustmentTransaction,
) {
  try {
    const response = await fetch(`${BASE_URL}/${editingTransaction.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingTransaction),
    });
    await handleResponse(response);
    return { success: true };
  } catch (error) {
    console.error('Error editing transaction:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Edit Transaction Error: ${errorMessage}`);
  }
}
