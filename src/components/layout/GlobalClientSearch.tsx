
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, User, X } from "lucide-react";
import { mockCustomers } from "@/lib/placeholder-data";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

type Customer = (typeof mockCustomers)[0];

export function GlobalClientSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Customer[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length > 0) {
      const filteredCustomers = mockCustomers.filter((customer) =>
        customer.phone.includes(query)
      );
      setResults(filteredCustomers);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);
  
  const handleSelectClient = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full  items-center">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="tel"
              placeholder="Search client by phone..."
              className="w-full rounded-lg bg-background pl-10 pr-10 border-2 border-primary ring-2 ring-primary/20"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
                <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()} // Prevents input from losing focus
        >
          <div className="flex flex-col space-y-1 p-2">
            {results.length > 0 ? (
              results.map((customer) => (
                <Link
                  key={customer.id}
                  href={`/clients/${encodeURIComponent(customer.email)}`}
                  className="flex items-center gap-3 rounded-md p-2 hover:bg-accent"
                  onClick={handleSelectClient}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={`https://picsum.photos/seed/${customer.name}/100`}
                      alt={customer.name}
                    />
                    <AvatarFallback>{customer.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {customer.phone}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No results found.
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
