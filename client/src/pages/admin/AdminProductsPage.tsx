import { useEffect, useState } from 'react';
import { Boxes, PackageCheck } from 'lucide-react';
import {
  CatalogManagerPage,
  PublishedCell,
  SampleCell,
  UpdatedCell
} from '../../components/admin/CatalogManagerPage';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Overlay';
import { Alert } from '../../components/ui/Feedback';
import { Checkbox, Input } from '../../components/ui/Form';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { formatPrice } from '../../lib/format';
import { updateProductStock } from '../../services/admin';
import type { ProductRow } from '../../types';

function StockCell({ product }: { product: ProductRow }) {
  if (!product.track_stock) {
    return <Badge tone="neutral">Not tracked</Badge>;
  }
  if (product.stock_quantity <= 0) {
    return <Badge tone="danger">Out of stock</Badge>;
  }
  if (product.stock_quantity <= product.low_stock_threshold) {
    return <Badge tone="warning">Low · {product.stock_quantity} left</Badge>;
  }
  return <Badge tone="success">{product.stock_quantity} in stock</Badge>;
}

function StockModal({
  product,
  onClose,
  onSaved
}: {
  product: ProductRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [quantity, setQuantity] = useState(String(product.stock_quantity));
  const [trackStock, setTrackStock] = useState(product.track_stock);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuantity(String(product.stock_quantity));
    setTrackStock(product.track_stock);
    setError(null);
  }, [product]);

  const save = async () => {
    const parsed = Number(quantity);
    if (!Number.isInteger(parsed) || parsed < 0) {
      setError('Enter a whole number of zero or more.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateProductStock(product.id, { stock_quantity: parsed, track_stock: trackStock });
      toast.success('Stock updated', `${product.name} now shows ${parsed} units.`);
      onSaved();
      onClose();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'The stock level could not be updated.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`Stock — ${product.name}`}
      description="Stock changes are audit-logged. The public website shows availability derived from these values."
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => void save()} loading={saving}>
            Save stock
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error ? (
          <Alert tone="danger" title="Not saved">
            <p>{error}</p>
          </Alert>
        ) : null}
        <Input
          label="Stock quantity"
          type="number"
          min="0"
          step="1"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          hint={`Low-stock warning at ${product.low_stock_threshold} units or fewer.`}
        />
        <Checkbox
          label={
            <span>
              <span className="font-semibold text-navy-900">Track stock for this product</span>
              <span className="mt-0.5 block text-xs text-slate-500">
                When tracking is off, the public page shows the product as “on request” rather than
                claiming it is available.
              </span>
            </span>
          }
          checked={trackStock}
          onChange={(event) => setTrackStock(event.target.checked)}
        />
        <div className="rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-500">
          <PackageCheck className="mb-1 h-4 w-4 text-teal-600" aria-hidden="true" />
          This page records a stock count only. It does not process payments, reservations or
          deliveries.
        </div>
      </div>
    </Modal>
  );
}

export function AdminProductsPage() {
  const { hasPermission } = useAuth();
  const [stockState, setStockState] = useState<{
    product: ProductRow;
    reload: () => void;
  } | null>(null);
  const canManageStock = hasPermission('products:stock');

  return (
    <>
      <CatalogManagerPage<ProductRow>
        resource="products"
        title="Products & stock"
        description="Maintain products and their available quantities. Stock figures are internal records, not an online shop checkout."
        createLabel="New product"
        searchPlaceholder="Search name, SKU or category"
        sortOptions={[
          { value: 'sort_order:asc', label: 'Display order' },
          { value: 'stock_quantity:asc', label: 'Lowest stock' },
          { value: 'stock_quantity:desc', label: 'Highest stock' },
          { value: 'updated_at:desc', label: 'Recently updated' },
          { value: 'name:asc', label: 'Name A–Z' }
        ]}
        columns={[
          { label: 'Product' },
          { label: 'Category' },
          { label: 'Price' },
          { label: 'Stock' },
          { label: 'Publication' },
          { label: 'Updated' }
        ]}
        rowLabel={(row) => row.name}
        extraActions={(row, { reload }) =>
          canManageStock ? (
            <Button
              variant="outline"
              small
              onClick={() => setStockState({ product: row, reload })}
            >
              <Boxes className="h-3.5 w-3.5" aria-hidden="true" />
              Stock
            </Button>
          ) : null
        }
        renderRow={(row) => [
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-navy-900">{row.name}</p>
              <SampleCell sample={row.is_sample} />
            </div>
            <p className="text-[11px] text-slate-400">SKU {row.sku}</p>
            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{row.description}</p>
          </div>,
          <span className="text-xs text-slate-600">{row.category}</span>,
          <div>
            <p className="text-sm font-semibold text-navy-900">
              {formatPrice(row.price, row.currency)}
            </p>
            <p className="text-[11px] text-slate-400">
              {row.price === null ? 'Shown as “price on request”' : row.currency}
            </p>
          </div>,
          <div>
            <StockCell product={row} />
            <p className="mt-1 text-[11px] text-slate-400">
              Low at {row.low_stock_threshold}
            </p>
          </div>,
          <PublishedCell published={row.published} />,
          <UpdatedCell value={row.updated_at} />
        ]}
        emptyMessage="No products have been added yet. The public products page will show an honest empty state."
        headerNote={
          <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs leading-5 text-slate-500">
            Prices left blank display as “price on request”. Sample products are never shown publicly.
            This system does not take online payments.
          </p>
        }
      />

      {stockState ? (
        <StockModal
          product={stockState.product}
          onClose={() => setStockState(null)}
          onSaved={stockState.reload}
        />
      ) : null}
    </>
  );
}
