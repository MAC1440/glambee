
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { mockCustomers } from "@/lib/placeholder-data";
import { useToast } from "@/hooks/use-toast";

export function GlobalClientSearch() {
  const [phone, setPhone] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSearch = () => {
    if (!phone) return;

    setIsSearching(true);
    setTimeout(() => {
      const customer = mockCustomers.find((c) => c.phone === phone);
      if (customer) {
        toast({
            title: "Client Found!",
            description: `Redirecting to ${customer.name}'s profile.`,
        });
        router.push(`/clients/${encodeURIComponent(customer.email)}`);
      } else {
        toast({
            title: "Client Not Found",
            description: "Redirecting to the new client registration page.",
            variant: "default"
        });
        // We can pass the phone number to the appointments page to pre-fill the form
        router.push(`/appointments?phone=${encodeURIComponent(phone)}`);
      }
      setIsSearching(false);
      setPhone(""); // Clear input after search
    }, 500);
  };

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="tel"
        placeholder="Search client by phone..."
        className="w-full rounded-lg bg-background pl-8"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        disabled={isSearching}
      />
    </div>
  );
}
