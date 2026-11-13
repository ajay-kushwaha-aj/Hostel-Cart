import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Link as LinkIcon,
  Edit3,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { PlatformId } from '@/types/order';
import { PLATFORMS } from '@/utils/constants';
import { formatINR, rupeesToPaise } from '@/utils/money';
import { validateProductUrl, validateQuantity, validateUnitPriceRupees } from '@/utils/validators';
import { addProductItem } from '@/services/itemService';

interface AddItemModalProps {
  orderId: string;
  platform: PlatformId;
  userId: string;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
  onItemAdded?: () => void;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  orderId,
  platform,
  userId,
  userName,
  isOpen,
  onClose,
  onItemAdded,
}) => {
  const [tab, setTab] = useState<'manual' | 'url'>('manual');

  // Form states
  const [productName, setProductName] = useState('');
  const [productURL, setProductURL] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPriceStr, setUnitPriceStr] = useState('');
  const [note, setNote] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentPlatformConfig = PLATFORMS[platform] || PLATFORMS.blinkit;
  const unitPrice = parseFloat(unitPriceStr) || 0;
  const itemSubtotalPaise = rupeesToPaise(unitPrice) * quantity;

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setProductURL(val);
    if (!val.trim()) {
      setUrlError(null);
      return;
    }
    const check = validateProductUrl(val, platform);
    setUrlError(check.isValid ? null : check.error || 'Invalid link');
  };

  const handleQuantityDelta = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(100, prev + delta)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!productName.trim()) {
      setFormError('Please enter the product name.');
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

    if (tab === 'url') {
      const urlCheck = validateProductUrl(productURL, platform);
      if (!urlCheck.isValid) {
        setFormError(urlCheck.error || 'Invalid platform URL.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (tab === 'manual') {
        await addProductItem(orderId, userId, userName, {
          entryType: 'manual',
          productName: productName.trim(),
          quantity,
          unitPriceRupees: unitPrice,
          note: note.trim() || undefined,
        });
      } else {
        await addProductItem(orderId, userId, userName, {
          entryType: 'url',
          productURL: productURL.trim(),
          productName: productName.trim(),
          quantity,
          unitPriceRupees: unitPrice,
          note: note.trim() || undefined,
        });
      }

      onItemAdded?.();
      onClose();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to add item to cart.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs"
              style={{ backgroundColor: currentPlatformConfig.themeColor }}
            >
              {currentPlatformConfig.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Add Item to Cart</h3>
              <p className="text-[11px] text-slate-500">
                For {currentPlatformConfig.name} &bull; Participant: {userName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 pb-2">
          <div className="grid grid-cols-2 p-1 bg-slate-100/80 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setTab('manual')}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                tab === 'manual'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Manual Entry</span>
            </button>

            <button
              type="button"
              onClick={() => setTab('url')}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                tab === 'url'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Product Link (URL)</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {tab === 'url' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Paste {currentPlatformConfig.name} Product Link
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={productURL}
                  onChange={handleUrlChange}
                  placeholder={`https://${currentPlatformConfig.allowedDomains[0]}/prn/...`}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                    urlError
                      ? 'border-rose-300 focus:ring-rose-500'
                      : 'border-slate-300 focus:ring-emerald-500'
                  }`}
                  required={tab === 'url'}
                />
              </div>

              {urlError ? (
                <p className="text-[11px] text-rose-600 font-medium">{urlError}</p>
              ) : productURL && (
                <div className="flex items-center justify-between text-[11px] text-emerald-700">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified {currentPlatformConfig.name} link
                  </span>
                  <a
                    href={productURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 underline text-slate-600 hover:text-slate-900"
                  >
                    <span>Check link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Product Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Product Name & Brand
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Amul Taaza Toned Milk 1L"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              required
            />
          </div>

          {/* Quantity & Unit Price Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Quantity Counter */}
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

            {/* Unit Price */}
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
                  placeholder="e.g. 54"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Variant or Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Variant Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. 1 Litre packet, cold if available"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Live Calculated Subtotal Pill */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-emerald-800 font-semibold">Your Item Subtotal:</span>
            <span className="text-emerald-950 font-black text-base">
              {formatINR(itemSubtotalPaise)}
              <span className="text-[11px] text-emerald-700 font-normal ml-1">
                ({quantity} &times; ₹{unitPrice || 0})
              </span>
            </span>
          </div>

          {/* Footer Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Adding Item to Cart...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add to Group Cart ({formatINR(itemSubtotalPaise)})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
