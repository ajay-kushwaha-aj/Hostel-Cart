import React, { useState } from 'react';
import { X, Plus, Minus, AlertCircle, Loader2, Save } from 'lucide-react';
import { OrderItem } from '@/types/order';
import { formatINR, paiseToRupees, rupeesToPaise } from '@/utils/money';
import { validateQuantity, validateUnitPriceRupees } from '@/utils/validators';
import { updateProductItem } from '@/services/itemService';

interface EditItemModalProps {
  item: OrderItem;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onItemUpdated?: () => void;
}

export const EditItemModal: React.FC<EditItemModalProps> = ({
  item,
  userId,
  isOpen,
  onClose,
  onItemUpdated,
}) => {
  const [productName, setProductName] = useState(item.productName);
  const [quantity, setQuantity] = useState(item.quantity);
  const [unitPriceStr, setUnitPriceStr] = useState(paiseToRupees(item.unitPricePaise).toString());
  const [note, setNote] = useState(item.note || '');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const unitPrice = parseFloat(unitPriceStr) || 0;
  const itemSubtotalPaise = rupeesToPaise(unitPrice) * quantity;

  const handleQuantityDelta = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(100, prev + delta)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!productName.trim()) {
      setFormError('Please enter product name.');
      return;
    }

    const qtyCheck = validateQuantity(quantity);
    if (!qtyCheck.isValid) {
      setFormError(qtyCheck.error || 'Invalid quantity.');
      return;
    }

    const priceCheck = validateUnitPriceRupees(unitPrice);
    if (!priceCheck.isValid) {
      setFormError(priceCheck.error || 'Invalid unit price.');
      return;
    }

    setSubmitting(true);
    try {
      await updateProductItem(item.orderId, item.id, userId, {
        productName: productName.trim(),
        quantity,
        unitPriceRupees: unitPrice,
        note: note.trim() || null,
      });

      onItemUpdated?.();
      onClose();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to update item.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Edit Item</h3>
            <p className="text-[11px] text-slate-500">Update quantity, price, or product name</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Product Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Product Name
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              required
            />
          </div>

          {/* Quantity & Unit Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Quantity
              </label>
              <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                <button
                  type="button"
                  onClick={() => handleQuantityDelta(-1)}
                  disabled={quantity <= 1}
                  className="p-2.5 text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full text-center bg-transparent text-sm font-bold text-slate-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleQuantityDelta(1)}
                  disabled={quantity >= 100}
                  className="p-2.5 text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Unit Price (₹ INR)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="50000"
                  value={unitPriceStr}
                  onChange={(e) => setUnitPriceStr(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Variant Note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. 1 Litre, Cold pack"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Live Subtotal */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-emerald-800 font-semibold">Updated Subtotal:</span>
            <span className="text-emerald-950 font-black text-base">
              {formatINR(itemSubtotalPaise)}
            </span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
