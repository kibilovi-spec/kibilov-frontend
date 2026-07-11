'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface AuditEntry {
  id: string;
  userId: string;
  action: string;
  target?: string;
  newValue?: any;
  ip?: string;
  createdAt: string;
  user?: { name: string; email: string };
}

export default function AdminAuditLog() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/api/admin/audit-logs?page=${page}&action=${filter}`)
      .then(({ data }) => {
        setLogs(data.logs || []);
        setTotal(data.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, filter]);

  const ACTION_COLORS: Record<string, string> = {
    B2B_APPROVE: 'bg-green-100 text-green-800',
    B2B_REJECT: 'bg-red-100 text-red-800',
    PRICE_HOLD_APPROVE: 'bg-blue-100 text-blue-800',
    PRICE_HOLD_REJECT: 'bg-orange-100 text-orange-800',
    PRODUCT_BULK_PRICE_CHANGE: 'bg-yellow-100 text-yellow-800',
    ORDER_STATUS_CHANGE: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-dark">AuditLog</h2>
        <select className="input-field w-auto text-sm" value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}>
          <option value="">ყველა მოქმედება</option>
          <option value="B2B_APPROVE">B2B დამტკიცება</option>
          <option value="B2B_REJECT">B2B უარყოფა</option>
          <option value="PRICE_HOLD_APPROVE">ფასი დამტკიცება</option>
          <option value="PRICE_HOLD_REJECT">ფასი უარყოფა</option>
          <option value="PRODUCT_BULK_PRICE_CHANGE">მასობრივი ფასცვლილება</option>
          <option value="ORDER_STATUS_CHANGE">შეკვეთის სტატუსი</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">იტვირთება...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 text-gray-400">ჩანაწერი არ არის</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Action</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Admin</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Target</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">IP</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">თარიღი</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-700'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{log.user?.name || log.userId?.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{log.target || '-'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{log.ip || '-'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(log.createdAt).toLocaleString('ka-GE')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > 20 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-1 text-sm">← წინა</button>
          <span className="px-3 py-1 text-sm text-gray-600">{page} / {Math.ceil(total / 20)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)} className="btn-secondary px-3 py-1 text-sm">შემდეგი →</button>
        </div>
      )}
    </div>
  );
}
