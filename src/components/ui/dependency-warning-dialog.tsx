"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";
import { ModuleKey, getModuleName } from "@/lib/utils/module-dependencies";

interface DependencyWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleKey: ModuleKey;
  warnings: string[];
  onContinue: () => void;
  onCancel: () => void;
}

export function DependencyWarningDialog({
  open,
  onOpenChange,
  moduleKey,
  warnings,
  onContinue,
  onCancel,
}: DependencyWarningDialogProps) {
  const moduleName = getModuleName(moduleKey);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <AlertDialogTitle>Permission Dependency Warning</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-4">
            <div className="space-y-3">
              <p className="font-medium">
                You are assigning permissions for <strong>{moduleName}</strong>, but the following dependencies are missing:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                {warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
              <p className="text-sm font-medium text-foreground pt-2">
                Staff members may not be able to use all features of this module without the required permissions.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onContinue}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            Continue Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

