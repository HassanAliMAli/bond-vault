"use client";

import { useState } from "react";
import { PageTransition } from "@/components/shared/page-transition";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { useAuditLogs, type AuditLog } from "@/hooks/use-admin";
import { Filter, ChevronDown, ChevronRight } from "lucide-react";

export function AdminAuditClient() {
  const [filters, setFilters] = useState<{ entityType?: string; startDate?: string; endDate?: string; page?: number }>({});
  const { data, isLoading, isError, refetch } = useAuditLogs(filters);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const totalPages = data ? Math.ceil((data.total ?? 0) / 50) : 0;

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Audit Logs</h1>
          <p className="text-sm text-gray mt-1">Track all administrative actions</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-4 w-4 mr-1" /> Filters
        </Button>
      </div>

      {showFilters && (
        <div className="rounded-[var(--radius-md)] bg-dark-800 border border-dark-600 p-4 flex items-end gap-3 flex-wrap">
          <div>
            <label className="text-xs text-gray block mb-1">Entity Type</label>
            <select value={filters.entityType || ""} onChange={e => setFilters(f => ({ ...f, entityType: e.target.value || undefined, page: 1 }))}
              className="px-3 py-2 rounded-[var(--radius-sm)] bg-dark-900 border border-dark-600 text-white text-sm focus:outline-none focus:border-gold/50">
              <option value="">All</option>
              <option value="user">User</option>
              <option value="payment">Payment</option>
              <option value="draw">Draw</option>
              <option value="notification">Notification</option>
              <option value="system_settings">Settings</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray block mb-1">Start Date</label>
            <input type="date" value={filters.startDate || ""} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value || undefined, page: 1 }))}
              className="px-3 py-2 rounded-[var(--radius-sm)] bg-dark-900 border border-dark-600 text-white text-sm focus:outline-none focus:border-gold/50" />
          </div>
          <div>
            <label className="text-xs text-gray block mb-1">End Date</label>
            <input type="date" value={filters.endDate || ""} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value || undefined, page: 1 }))}
              className="px-3 py-2 rounded-[var(--radius-sm)] bg-dark-900 border border-dark-600 text-white text-sm focus:outline-none focus:border-gold/50" />
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="rounded-[var(--radius-md)] bg-dark-800 border border-dark-600 p-6 space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-dark-700 rounded-[var(--radius-sm)] animate-pulse" />)}
        </div>
      ) : isError ? (
        <ErrorState title="Could not load audit logs" onRetry={() => refetch()} />
      ) : !data?.logs.length ? (
        <EmptyState title="No audit logs" description="No actions recorded yet" />
      ) : (
        <div className="rounded-[var(--radius-md)] bg-dark-800 border border-dark-600 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-600">
                  <th className="text-left py-3 px-4 text-gray font-medium w-8"></th>
                  <th className="text-left py-3 px-4 text-gray font-medium">Action</th>
                  <th className="text-left py-3 px-4 text-gray font-medium">Entity</th>
                  <th className="text-left py-3 px-4 text-gray font-medium">User ID</th>
                  <th className="text-left py-3 px-4 text-gray font-medium">IP</th>
                  <th className="text-left py-3 px-4 text-gray font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.logs.map((log: AuditLog) => {
                  const isExpanded = expandedRow === log.id;
                  const hasMetadata = !!log.metadata;
                  return (
                    <tr key={log.id} className="border-b border-dark-700 transition-colors">
                      <td className="py-3 px-4">
                        {hasMetadata && (
                          <button onClick={() => setExpandedRow(isExpanded ? null : log.id)} className="text-gray hover:text-white transition-colors">
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-white font-medium">{log.action}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray">{log.entityType}{log.entityId ? `:${log.entityId.slice(0, 8)}...` : ""}</span>
                      </td>
                      <td className="py-3 px-4 text-gray font-mono text-xs">{log.userId ? `${log.userId.slice(0, 12)}...` : "—"}</td>
                      <td className="py-3 px-4 text-gray font-mono text-xs">{log.ipAddress || "—"}</td>
                      <td className="py-3 px-4 text-gray">{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {expandedRow && data.logs.find(l => l.id === expandedRow)?.metadata && (
            <div className="px-4 py-3 border-t border-dark-600 bg-dark-900/50">
              <pre className="text-xs text-gray font-mono whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
                {(() => {
                  try {
                    return JSON.stringify(JSON.parse(data.logs.find(l => l.id === expandedRow)!.metadata!), null, 2);
                  } catch {
                    return data.logs.find(l => l.id === expandedRow)!.metadata;
                  }
                })()}
              </pre>
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-dark-600">
              <span className="text-sm text-gray">{data?.total ?? 0} total entries</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray">Page {filters.page ?? 1} of {totalPages}</span>
                <Button variant="ghost" size="sm" disabled={(filters.page ?? 1) <= 1}
                  onClick={() => setFilters(f => ({ ...f, page: (f.page ?? 1) - 1 }))}>Previous</Button>
                <Button variant="ghost" size="sm"
                  disabled={(filters.page ?? 1) >= totalPages}
                  onClick={() => setFilters(f => ({ ...f, page: (f.page ?? 1) + 1 }))}>Next</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </PageTransition>
  );
}
