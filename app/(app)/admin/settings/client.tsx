"use client";

import { useState } from "react";
import { PageTransition } from "@/components/shared/page-transition";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminSettings, useUpdateSetting, type SettingsItem } from "@/hooks/use-admin";
import { Save } from "lucide-react";

export function AdminSettingsClient() {
  const { data, isLoading, isError, refetch } = useAdminSettings();
  const updateSetting = useUpdateSetting();
  const [edits, setEdits] = useState<Record<string, string>>({});

  const getValue = (item: SettingsItem) => edits[item.key] ?? item.value;

  const handleSave = async (key: string) => {
    await updateSetting.mutateAsync({ key, value: edits[key] });
    setEdits(prev => { const { [key]: _unused, ...rest } = prev; return rest; });
  };

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">System Settings</h1>
        <p className="text-sm text-gray mt-1">Configure global platform settings</p>
      </div>

      {isLoading ? (
        <div className="rounded-[var(--radius-md)] bg-dark-800 border border-dark-600 p-6 space-y-4">
          {[1,2,3,4].map(i => <div key={i} className="h-14 bg-dark-700 rounded-[var(--radius-sm)] animate-pulse" />)}
        </div>
      ) : isError ? (
        <ErrorState title="Could not load settings" onRetry={() => refetch()} />
      ) : !data?.settings.length ? (
        <EmptyState title="No settings yet" description="Add your first setting below" />
      ) : (
        <div className="rounded-[var(--radius-md)] bg-dark-800 border border-dark-600 overflow-hidden">
          <div className="divide-y divide-dark-700">
            {data.settings.map((item: SettingsItem) => (
              <div key={item.key} className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <label className="text-sm font-medium text-white block mb-1">{item.key}</label>
                  <Input
                    value={getValue(item)}
                    onChange={e => setEdits({ ...edits, [item.key]: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  {edits[item.key] !== undefined && edits[item.key] !== item.value && (
                    <Button size="sm" variant="primary" onClick={() => handleSave(item.key)} loading={updateSetting.isPending}>
                      <Save className="h-3.5 w-3.5 mr-1" /> Save
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="rounded-[var(--radius-md)] bg-dark-800 border border-dark-600 p-5">
          <h2 className="text-lg font-semibold text-white mb-3">Add New Setting</h2>
          <AddSettingForm onSaved={() => refetch()} />
        </div>
      )}
    </PageTransition>
  );
}

function AddSettingForm({ onSaved }: { onSaved: () => void }) {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const updateSetting = useUpdateSetting();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key || !value) return;
    await updateSetting.mutateAsync({ key, value });
    setKey("");
    setValue("");
    onSaved();
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="flex-1">
        <label className="text-sm text-gray mb-1 block">Key</label>
        <input type="text" value={key} onChange={e => setKey(e.target.value)}
          className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] bg-dark-900 border border-dark-600 text-white text-sm focus:outline-none focus:border-gold/50"
          placeholder="setting_key" />
      </div>
      <div className="flex-1">
        <label className="text-sm text-gray mb-1 block">Value</label>
        <input type="text" value={value} onChange={e => setValue(e.target.value)}
          className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] bg-dark-900 border border-dark-600 text-white text-sm focus:outline-none focus:border-gold/50"
          placeholder="setting value" />
      </div>
      <Button type="submit" variant="primary" size="sm" loading={updateSetting.isPending}>Add</Button>
    </form>
  );
}
