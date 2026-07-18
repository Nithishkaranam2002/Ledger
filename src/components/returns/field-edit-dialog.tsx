"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ReturnField } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface FieldEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field: ReturnField | null;
  saving: boolean;
  onSave: (fieldId: string, value: string) => void | Promise<void>;
}

export function FieldEditDialog({
  open,
  onOpenChange,
  field,
  saving,
  onSave,
}: FieldEditDialogProps) {
  // Remount via key from parent when the field changes — keeps value in sync
  // without a setState-in-effect.
  const [value, setValue] = useState(field?.value ?? "");

  return (
    <Dialog
      open={open && field != null}
      onOpenChange={(next) => {
        if (!next && !saving) onOpenChange(false);
      }}
    >
      {field ? (
        <DialogContent className="sm:max-w-md" showCloseButton={!saving}>
          <DialogHeader>
            <DialogTitle>Edit {field.label}</DialogTitle>
            <DialogDescription>
              Manual correction settles this field as verified.
            </DialogDescription>
          </DialogHeader>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Value
            </span>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={saving}
              className="h-9 rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              autoFocus
            />
          </label>

          <DialogFooter>
            <button
              type="button"
              disabled={saving}
              className={cn(buttonVariants({ variant: "outline" }))}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving || value.trim().length === 0}
              className={cn(buttonVariants())}
              onClick={() => onSave(field.id, value.trim())}
            >
              {saving ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : null}
              {saving ? "Saving…" : "Save & verify"}
            </button>
          </DialogFooter>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
