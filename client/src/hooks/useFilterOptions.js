import { useState, useEffect } from 'react';
import { filterOptionAPI } from '../services/api';

const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'];
const DEFAULT_PAYMENT_METHODS = ['Cash', 'Card', 'Online', 'Other'];

export function useFilterOptions() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [paymentMethods, setPaymentMethods] = useState(DEFAULT_PAYMENT_METHODS);

  useEffect(() => {
    filterOptionAPI.getAll()
      .then((res) => {
        const options = res.data || [];
        const cats = options.filter((o) => o.type === 'category').map((o) => o.label);
        const methods = options.filter((o) => o.type === 'paymentMethod').map((o) => o.label);
        if (cats.length > 0) setCategories(cats);
        if (methods.length > 0) setPaymentMethods(methods);
      })
      .catch(() => {});
  }, []);

  return { categories, paymentMethods };
}
