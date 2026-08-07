import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { budgetAPI } from '../../services/api';

const money = (n) => Math.round(n).toLocaleString('en-IN');
const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

export default function BudgetManager({ currentBudget }) {
  const [request, setRequest] = useState(null);
  const [input, setInput] = useState(currentBudget ? String(currentBudget) : '');
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchRequest = async () => {
    try {
      const res = await budgetAPI.getMyRequest();
      setRequest(res.data);
    } catch {
      setRequest(null);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, []);

  useEffect(() => {
    if (!request || request.status !== 'pending') {
      setInput((prev) => String(currentBudget));
    }
  }, [currentBudget, request]);

  const pending = request?.status === 'pending';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(input);
    if (isNaN(amount) || amount < 0) return toast.error('Please enter a valid amount');
    if (amount === currentBudget) return toast.error('This is already your current budget');
    setSubmitting(true);
    try {
      await budgetAPI.requestChange(amount);
      toast.success('Request sent — waiting for admin approval');
      await fetchRequest();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel your pending budget request?')) return;
    setCancelling(true);
    try {
      await budgetAPI.cancelRequest();
      toast.success('Request cancelled');
      setRequest(null);
    } catch (err) {
      toast.error('Failed to cancel request');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-3">
      {pending && (
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25">
          <div className="flex items-start gap-2.5 min-w-0">
            <svg className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <div className="min-w-0">
              <p className="text-sm font-medium text-amber-200">Budget change pending approval</p>
              <p className="text-xs text-amber-300/70 mt-0.5">
                You requested Rs. {money(request.requestedAmount)} (from Rs. {money(request.currentAmount)}) on {formatDate(request.createdAt)}. Your current budget stays until an admin approves.
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="btn-secondary !py-1.5 !px-3 text-xs shrink-0"
          >
            {cancelling ? 'Cancelling...' : 'Cancel request'}
          </button>
        </div>
      )}

      {request?.status === 'rejected' && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25">
          <p className="text-sm font-medium text-red-300">Budget request rejected</p>
          <p className="text-xs text-red-300/70 mt-0.5">
            Your request for Rs. {money(request.requestedAmount)} was declined{request.adminNote ? ` — ${request.adminNote}` : ''}. You can submit a new request.
          </p>
        </div>
      )}

      {request?.status === 'approved' && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
          <p className="text-sm font-medium text-emerald-300">Request approved</p>
          <p className="text-xs text-emerald-300/70 mt-0.5">
            Your budget was updated to Rs. {money(request.requestedAmount)}{request.adminNote ? ` — ${request.adminNote}` : ''}. You can submit a new request anytime.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-surface-500">Rs.</span>
          <input
            type="number"
            className="input-field !pl-12"
            placeholder="0"
            min="0"
            disabled={pending}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <button type="submit" disabled={submitting || pending} className="btn-primary">
          {submitting ? 'Sending...' : pending ? 'Awaiting approval' : 'Request change'}
        </button>
      </form>
    </div>
  );
}
