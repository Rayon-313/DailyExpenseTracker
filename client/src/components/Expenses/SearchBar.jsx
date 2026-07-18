import { useState, useCallback } from 'react';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [timer, setTimer] = useState(null);

  const handleChange = (value) => {
    setQuery(value);
    if (timer) clearTimeout(timer);
    const newTimer = setTimeout(() => {
      onSearch(value);
    }, 300);
    setTimer(newTimer);
  };

  const handleClear = () => {
    setQuery('');
    if (timer) clearTimeout(timer);
    onSearch('');
  };

  return (
    <div className="relative flex-1">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
      <input
        type="text"
        placeholder="Search expenses..."
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        className="input-field pl-10 pr-9"
      />
      {query && (
        <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
