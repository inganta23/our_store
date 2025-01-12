'use server';

import { Product } from '@/types';

const BASE_URL = `${process.env.API_URL}/api/products`;

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

export async function importProducts() {
  try {
    const response = await fetch(`${BASE_URL}/import`, { method: 'POST' });
    const data = await handleResponse(response);
    return data;
  } catch (error) {
    console.error('Error importing products:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Import Products Error: ${errorMessage}`);
  }
}

export async function fetchProducts(
  page: number,
  limit: number = 8,
  search: string = '',
) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });

  try {
    const response = await fetch(`${BASE_URL}?${params}`);
    const data = await handleResponse(response);
    return data.data as Product[];
  } catch (error) {
    console.error('Error fetching products:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Fetch Products Error: ${errorMessage}`);
  }
}

export async function deleteProduct(sku: string) {
  try {
    const response = await fetch(`${BASE_URL}/${sku}`, { method: 'DELETE' });
    await handleResponse(response);
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Delete Product Error: ${errorMessage}`);
  }
}

export async function createProduct(newProduct: Product) {
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    });
    await handleResponse(response);
    return { success: true };
  } catch (error) {
    console.error('Error creating product:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Create Product Error: ${errorMessage}`);
  }
}
