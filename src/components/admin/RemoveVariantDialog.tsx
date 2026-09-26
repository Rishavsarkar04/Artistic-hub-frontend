import React from 'react';
import { deleteMockVariant } from '@/data/admin/products';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import type { AdminProduct, AdminVariant } from '@/types';

/**
 * Confirms and removes one variant straight away (from the product list). Calls `onRemoved` once it's gone.
 * MOCK: with the API, useApiMutation<void, void>(endpoints.admin.products.variants.delete(product.id, variant.id), 'DELETE').
 */
export function RemoveVariantDialog({ product, variant, onClose, onRemoved }: { product: AdminProduct; variant: AdminVariant; onClose: () => void; onRemoved: () => void }) {
  return (
    <ConfirmDialog open onClose={onClose} title={`Remove ${variant.name} from ${product.name}?`} confirmLabel="Remove variant" cancelLabel="Keep variant"
      description={`Customers won't be able to buy ${variant.name} (${variant.sku}) any more, and its photos are removed. Past orders keep their own copy. This can't be undone. To hide it for now instead, turn it off on the edit page.`}
      onConfirm={async () => { await deleteMockVariant(product.id, variant.id); onRemoved(); }} />
  );
}
