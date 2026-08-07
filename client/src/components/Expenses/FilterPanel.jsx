import { useState, useRef, useEffect } from 'react';
import { useFilterOptions } from '../../hooks/useFilterOptions';

export default function FilterPanel({ filters, onFilterChange }) {
  const { categories, paymentMethods } = useFilterOptions();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value || undefined });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasFilters = Object.values(filters).some((v) => v !== undefined);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`btn-secondary flex items-center gap-2 ${hasFilters ? 'ring-1 ring-brand-500/50 border-brand-500/50' : ''}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
        </svg>
        Filters
        {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
      </button>
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-surface-900 border border-surface-700 rounded-2xl p-5 space-y-4 z-50 shadow-2xl shadow-black/35">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Filters</h3>
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-brand-300 hover:text-brand-400 transition-colors">
                Clear all
              </button>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-400 mb-1.5">Category</label>
            <select className="input-field" value={filters.category || ''} onChange={(e) => handleChange('category', e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-400 mb-1.5">Payment Method</label>
            <select className="input-field" value={filters.paymentMethod || ''} onChange={(e) => handleChange('paymentMethod', e.target.value)}>
              <option value="">All Methods</option>
              {paymentMethods.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">From</label>
              <input type="date" className="input-field" value={filters.startDate || ''} onChange={(e) => handleChange('startDate', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">To</label>
              <input type="date" className="input-field" value={filters.endDate || ''} onChange={(e) => handleChange('endDate', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Min Amount</label>
              <input type="number" className="input-field" placeholder="0" value={filters.minAmount || ''} onChange={(e) => handleChange('minAmount', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Max Amount</label>
              <input type="number" className="input-field" placeholder="99999" value={filters.maxAmount || ''} onChange={(e) => handleChange('maxAmount', e.target.value)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
