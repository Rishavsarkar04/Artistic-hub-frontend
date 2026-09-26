import React from 'react';
import { deleteMockProduct } from '@/data/admin/products';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import type { AdminProduct } from '@/types';

/**
 * Confirms and deletes a product (used on the product list and the edit page). Calls `onDeleted` once it's gone.
 * MOCK: with the API, useApiMutation<void, void>(endpoints.admin.products.delete(product.id), 'DELETE').
 */
export function DeleteProductDialog({ product, open, onClose, onDeleted }: { product: AdminProduct; open: boolean; onClose: () => void; onDeleted: () => void }) {
  const count = product.variants.length;
  return (
    <ConfirmDialog open={open} onClose={onClose} title={`Delete ${product.name}?`} confirmLabel="Delete product" cancelLabel="Keep product"
      description={`This removes the product, its ${count} ${count === 1 ? 'variant' : 'variants'} and their photos from the shop. Past orders keep their own copy of what was bought. This can't be undone.`}
      onConfirm={async () => { await deleteMockProduct(product.id); onDeleted(); }} />
  );
}
