import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';

const money = (n) => Math.round(n).toLocaleString('en-IN');
const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

const statusStyle = {
  pending: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
  approved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  rejected: 'text-red-400 bg-red-500/10 border-red-500/20',
};

export default function AdminBudgetRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getBudgetRequests();
      setRequests(res.data);
    } catch {
      toast.error('Failed to load budget requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const review = async (req, status) => {
    setLoading(true);
    try {
      await adminAPI.reviewBudgetRequest(req._id, status);
      toast.success(status === 'approved' ? `Budget updated for ${req.user?.name}` : 'Request rejected');
      await fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to review request');
    } finally {
      setLoading(false);
    }
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-7 h-7 border-2 border-surface-700 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="card py-16 text-center">
        <p className="text-sm font-medium text-white">No budget requests</p>
        <p className="text-xs text-surface-500 mt-1">When users ask to change their budget, their requests will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((req) => (
        <div key={req._id} className="card p-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2.5 min-w-[180px] flex-1">
              <div className="w-8 h-8 rounded-full bg-brand-500/15 border border-brand-500/20 flex items-center justify-center text-xs font-semibold text-brand-300 flex-shrink-0">
                {req.user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{req.user?.name || 'Unknown'}</p>
                <p className="text-xs text-surface-500 truncate">{req.user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-surface-400 tabular-nums">Rs. {money(req.currentAmount)}</span>
              <svg className="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
              <span className="font-semibold text-white tabular-nums">Rs. {money(req.requestedAmount)}</span>
            </div>

            <span className={`text-[11px] px-2 py-0.5 rounded-full border capitalize ${statusStyle[req.status]}`}>
              {req.status}
            </span>

            <span className="text-xs text-surface-500 tabular-nums">{formatDate(req.createdAt)}</span>

            {req.status === 'pending' && (
              <div className="flex items-center gap-2 ml-auto">
                <button onClick={() => review(req, 'approved')} className="btn-primary !py-2 !px-4 text-sm flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Approve
                </button>
                <button onClick={() => review(req, 'rejected')} className="btn-secondary !py-2 !px-4 text-sm hover:!border-red-500/50 hover:!text-red-400">
                  Reject
                </button>
              </div>
            )}
          </div>

          {req.adminNote && (
            <p className="text-xs text-surface-500 mt-3 border-t border-surface-800 pt-3">
              <span className="text-surface-400 font-medium">Admin note:</span> {req.adminNote}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
