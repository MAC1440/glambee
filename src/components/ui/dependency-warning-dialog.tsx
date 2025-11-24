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
              <div className="space-y-2">
                {warnings.map((warning, index) => {
                  // Check if warning contains bullet points (starts with "Without" and has \n)
                  const hasBulletPoints = warning.includes('\n•');
                  if (hasBulletPoints) {
                    // Split by \n and render as bullet list
                    const lines = warning.split('\n').filter(Boolean);
                    const firstLine = lines[0]; // The main message
                    const bulletPoints = lines.slice(1); // The bullet points
                    
                    return (
                      <div key={index} className="text-sm text-muted-foreground space-y-1">
                        <p className="font-medium text-foreground mb-1">{firstLine}</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          {bulletPoints.map((bullet, bulletIndex) => (
                            <li key={bulletIndex}>{bullet.replace('•', '').trim()}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                  
                  // Regular warning without bullet points
                  return (
                    <p key={index} className="text-sm text-muted-foreground">
                      {warning}
                    </p>
                  );
                })}
              </div>
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

