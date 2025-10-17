
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { ClientForm } from "./ClientForm";
import type { Client, ClientFormData } from "./ClientForm";

type ClientFormDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  client?: Client;
  onSave: (clientData: ClientFormData) => void;
  isLoading?: boolean;
};

export function ClientFormDialog({
  isOpen,
  onOpenChange,
  client,
  onSave,
  isLoading = false,
}: ClientFormDialogProps) {
  const title = client ? `Edit ${client.name}` : `Add New Client`;
  const description = client
    ? "Update the client's details below."
    : "Fill out the form to add a new client.";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ClientForm client={client} onSave={onSave} onCancel={() => onOpenChange(false)} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  );
}
