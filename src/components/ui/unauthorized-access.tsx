"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldX } from "lucide-react";

interface UnauthorizedAccessProps {
  moduleName?: string;
}

export function UnauthorizedAccess({ moduleName }: UnauthorizedAccessProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldX className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription className="mt-2">
            {moduleName 
              ? `You don't have permission to access the ${moduleName} module.`
              : "You don't have permission to access this module."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">
            Please contact your administrator to request access to this module.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

