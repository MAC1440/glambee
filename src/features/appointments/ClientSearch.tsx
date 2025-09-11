
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, Info } from "lucide-react";

type ClientSearchProps = {
  onSearch: (phone: string) => void;
  isSearching: boolean;
  mockCustomers: { phone: string; name: string }[];
};

export function ClientSearch({ onSearch, isSearching, mockCustomers }: ClientSearchProps) {
  const [phone, setPhone] = useState("");

  const handleSearchClick = () => {
    if (phone) {
      onSearch(phone);
    }
  };

  return (
    <div className="flex flex-col gap-8 items-center">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-headline font-bold">Appointments</h1>
        <p className="text-muted-foreground mt-2">
          Find a client by phone number to manage or book appointments.
        </p>
      </div>

      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Find Client</CardTitle>
          <CardDescription>
            Enter a client's phone number to see their history or register them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full items-center space-x-2">
            <Input
              type="tel"
              id="phone"
              placeholder="+923001234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSearching}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
            />
            <Button onClick={handleSearchClick} disabled={!phone || isSearching}>
              <Search className="mr-2 h-4 w-4" />
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full max-w-2xl mt-8 bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-5 w-5 text-primary" />
            For Testing
          </CardTitle>
          <CardDescription>
            Use these phone numbers to test the client search functionality. This
            card will be removed after backend integration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {mockCustomers.map((c) => (
              <li key={c.phone}>
                <strong>{c.name}:</strong>{" "}
                <code className="bg-background p-1 rounded-sm">{c.phone}</code>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
