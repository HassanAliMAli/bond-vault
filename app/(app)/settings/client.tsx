"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageTransition } from "@/components/shared/page-transition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { LogOut, Mail, Key, Trash2, Shield, Download, Upload, Check, X } from "lucide-react";

export function SettingsPageClient() {
  const router = useRouter();
  const { user } = useAuth();
  const [changingPassword, setChangingPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const { data: permissions } = useQuery({
    queryKey: ["user", "permissions"],
    queryFn: () => api.user.permissions(),
    staleTime: 60_000,
  });

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) return;
    if (newPassword.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (newPassword !== confirmNewPassword) { toast.error("Passwords do not match"); return; }
    setLoading(true);
    try {
      const result = await authClient.changePassword({ currentPassword, newPassword });
      if (result.error) {
        toast.error(result.error.message || "Failed to change password");
      } else {
        toast.success("Password updated");
        setChangingPassword(false);
        setCurrentPassword(""); setNewPassword(""); setConfirmNewPassword("");
      }
    } catch { toast.error("Failed to change password"); }
    finally { setLoading(false); }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await api.user.deleteAccount();
      await authClient.signOut();
      router.push("/login");
    } catch { toast.error("Failed to delete account"); }
    finally { setLoading(false); }
  };

  return (
    <PageTransition className="space-y-6 max-w-2xl mx-auto">
      <div><h1 className="text-2xl lg:text-3xl font-bold text-white">Settings</h1><p className="text-sm text-gray mt-1">Manage your account and preferences</p></div>
      <Card variant="elevated">
        <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="h-4 w-4 text-gold" />Account</CardTitle><CardDescription>Your account details</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-[var(--radius-sm)] bg-dark-700">
              <div><p className="text-sm font-medium text-white">Email</p><p className="text-sm text-gray">{user?.email ?? "..."}</p></div>
              <span className="text-xs text-green bg-green/10 px-2 py-1 rounded-full font-medium">Verified</span>
            </div>
            <Button variant="secondary" size="lg" className="w-full" onClick={() => setChangingPassword(!changingPassword)}><Key className="h-4 w-4" />Change Password</Button>
            {changingPassword && (
              <div className="space-y-3 p-4 rounded-[var(--radius-md)] border border-dark-600 animate-fade-up">
                <Input label="Current password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
                <Input label="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 8 characters" />
                <Input label="Confirm new password" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="Re-enter new password" />
                <div className="flex gap-3 pt-2">
                  <Button variant="primary" size="md" className="flex-1" onClick={handleChangePassword} loading={loading}>Update Password</Button>
                  <Button variant="ghost" size="md" className="flex-1" onClick={() => setChangingPassword(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Card variant="elevated">
        <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-4 w-4 text-gold" />Plan & Permissions</CardTitle><CardDescription>Your current plan and feature access</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-[var(--radius-sm)] bg-dark-700">
              <div className="flex items-center gap-2"><Upload className="h-4 w-4 text-gray" /><span className="text-sm text-white">Import Bonds</span></div>
              {permissions?.canImport ? <Check className="h-4 w-4 text-green" /> : <X className="h-4 w-4 text-red" />}
            </div>
            <div className="flex items-center justify-between p-3 rounded-[var(--radius-sm)] bg-dark-700">
              <div className="flex items-center gap-2"><Download className="h-4 w-4 text-gray" /><span className="text-sm text-white">Export Portfolio</span></div>
              {permissions?.canExport ? <Check className="h-4 w-4 text-green" /> : <X className="h-4 w-4 text-red" />}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card variant="elevated">
        <CardHeader><CardTitle className="flex items-center gap-2"><LogOut className="h-4 w-4 text-gold" />Session</CardTitle><CardDescription>Sign out of your account</CardDescription></CardHeader>
        <CardContent><Button variant="secondary" size="lg" className="w-full" onClick={handleSignOut}><LogOut className="h-4 w-4" />Sign Out</Button></CardContent>
      </Card>
      <Card variant="elevated">
        <CardHeader><CardTitle className="flex items-center gap-2 text-red"><Shield className="h-4 w-4" />Danger Zone</CardTitle><CardDescription>Irreversible actions</CardDescription></CardHeader>
        <CardContent>
          {!showDeleteConfirm ? (
            <Button variant="destructive" size="lg" className="w-full" onClick={() => setShowDeleteConfirm(true)}><Trash2 className="h-4 w-4" />Delete Account</Button>
          ) : (
            <div className="space-y-3 p-4 rounded-[var(--radius-md)] border border-red/30 bg-red/5 animate-fade-up">
              <p className="text-sm text-white font-medium">Are you absolutely sure? This will permanently delete your account and all bonds.</p>
              <div className="flex gap-3">
                <Button variant="destructive" size="md" className="flex-1" onClick={handleDeleteAccount} loading={loading}>Yes, Delete Everything</Button>
                <Button variant="secondary" size="md" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </PageTransition>
  );
}
