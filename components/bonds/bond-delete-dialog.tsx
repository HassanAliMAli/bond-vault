"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface BondDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bondNumber: string;
  denomination: string;
  loading?: boolean;
}

export function BondDeleteDialog({ open, onClose, onConfirm, bondNumber, denomination, loading = false }: BondDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-orange/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-orange" />
          </div>
          <DialogTitle className="text-center">Remove Bond?</DialogTitle>
          <DialogDescription className="text-center">
            This will permanently remove bond <span className="font-semibold text-black">#{bondNumber}</span>{" "}
            ({denomination}) from your vault. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-3 pt-2">
          <Button variant="destructive" size="lg" className="flex-1" onClick={onConfirm} loading={loading}>Yes, Remove</Button>
          <Button variant="secondary" size="lg" className="flex-1" onClick={onClose} disabled={loading}>Keep It</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
