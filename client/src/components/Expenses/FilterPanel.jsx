import { useState } from 'react';

const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'];
const paymentMethods = ['Cash', 'Card', 'Online', 'Other'];

export default function FilterPanel({ filters, onFilterChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value || undefined });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasFilters = Object.values(filters).some((v) => v !== undefined);

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className={`btn-secondary flex items-center gap-2 ${hasFilters ? 'ring-2 ring-accent-500' : ''}`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
        Filters
        {hasFilters && <span className="w-2 h-2 rounded-full bg-accent-500"></span>}
      </button>
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 glass-dark p-5 space-y-4 z-50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filters</h3>
            {hasFilters && <button onClick={clearFilters} className="text-sm text-accent-400 hover:text-accent-300">Clear all</button>}
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Category</label>
            <select className="input-field" value={filters.category || ''} onChange={(e) => handleChange('category', e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Payment Method</label>
            <select className="input-field" value={filters.paymentMethod || ''} onChange={(e) => handleChange('paymentMethod', e.target.value)}>
              <option value="">All Methods</option>
              {paymentMethods.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/60 mb-1">From</label>
              <input type="date" className="input-field" value={filters.startDate || ''} onChange={(e) => handleChange('startDate', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">To</label>
              <input type="date" className="input-field" value={filters.endDate || ''} onChange={(e) => handleChange('endDate', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/60 mb-1">Min Amount</label>
              <input type="number" className="input-field" placeholder="0" value={filters.minAmount || ''} onChange={(e) => handleChange('minAmount', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Max Amount</label>
              <input type="number" className="input-field" placeholder="99999" value={filters.maxAmount || ''} onChange={(e) => handleChange('maxAmount', e.target.value)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
