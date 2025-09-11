
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
    <div className="relative w-full max-w-xs items-center">
      <Input
        type="tel"
        placeholder="Search client..."
        className="w-full rounded-lg bg-background pl-3 pr-10"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        disabled={isSearching}
      />
       <Button 
        size="icon"
        variant="ghost"
        className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        onClick={handleSearch} 
        disabled={!phone || isSearching}
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </Button>
    </div>
  );
}
