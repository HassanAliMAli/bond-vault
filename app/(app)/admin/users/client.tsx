"use client";

import { useState } from "react";
import { PageTransition } from "@/components/shared/page-transition";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminUsers, useSuspendUser, useRestoreUser, type AdminUser } from "@/hooks/use-admin";
import { Search, UserCheck, UserX, Loader2 } from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  active: "bg-green/10 text-green border border-green/30",
  admin: "bg-gold/10 text-gold border border-gold/30",
  suspended: "bg-red/10 text-red border border-red/30",
  deleted: "bg-dark-600 text-gray border border-dark-500",
};

export function AdminUsersClient() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { data, isLoading, isError, refetch } = useAdminUsers(search || undefined, page);
  const suspend = useSuspendUser();
  const restore = useRestoreUser();

  const handleSuspend = async (id: string) => {
    if (!confirm("Suspend this user? They will lose access until restored.")) return;
    setActionLoading(id);
    try {
      await suspend.mutateAsync(id);
      toast.success("User suspended");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to suspend user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestore = async (id: string) => {
    if (!confirm("Restore this user?")) return;
    setActionLoading(id);
    try {
      await restore.mutateAsync(id);
      toast.success("User restored");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to restore user");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Users</h1>
          <p className="text-sm text-gray mt-1">Manage all registered users</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray" />
          <input
            type="text" placeholder="Search by email..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-[var(--radius-sm)] bg-dark-800 border border-dark-600 text-white placeholder-gray text-sm focus:outline-none focus:border-gold/50 transition-colors"
          />
        </div>
        <span className="text-sm text-gray">{data?.total ?? "..."} users</span>
      </div>

      {isLoading ? (
        <div className="rounded-[var(--radius-md)] bg-dark-800 border border-dark-600 p-6">
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-12 bg-dark-700 rounded-[var(--radius-sm)] animate-pulse" />
            ))}
          </div>
        </div>
      ) : isError ? (
        <ErrorState title="Could not load users" onRetry={() => refetch()} />
      ) : !data?.users.length ? (
        <EmptyState title="No users found" description={search ? "Try a different search term" : "No users registered yet"} />
      ) : (
        <div className="rounded-[var(--radius-md)] bg-dark-800 border border-dark-600 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-600">
                  <th className="text-left py-3 px-4 text-gray font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-gray font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-gray font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray font-medium">Joined</th>
                  <th className="text-right py-3 px-4 text-gray font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((user: AdminUser) => (
                  <tr key={user.id} className="border-b border-dark-700 hover:bg-dark-700/50 transition-colors">
                    <td className="py-3 px-4 text-white">{user.email}</td>
                    <td className="py-3 px-4 text-white">{user.name || user.fullName || "—"}</td>
                    <td className="py-3 px-4">
                      <Badge className={statusColors[user.status] || statusColors.active}>{user.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-gray">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(user.status === "active" || user.status === "admin") && (
                          <button
                            onClick={() => handleSuspend(user.id)}
                            disabled={actionLoading === user.id}
                            className="text-red hover:text-red-light transition-colors p-1 disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Suspend"
                          >
                            {actionLoading === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserX className="h-4 w-4" />}
                          </button>
                        )}
                        {user.status === "suspended" && (
                          <button
                            onClick={() => handleRestore(user.id)}
                            disabled={actionLoading === user.id}
                            className="text-green hover:text-green-light transition-colors p-1 disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Restore"
                          >
                            {actionLoading === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(data?.total ?? 0) > 20 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-dark-600">
              <span className="text-sm text-gray">Page {page} of {Math.ceil((data?.total ?? 0) / 20)}</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <Button variant="ghost" size="sm" disabled={page >= Math.ceil((data?.total ?? 0) / 20)} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </PageTransition>
  );
}
