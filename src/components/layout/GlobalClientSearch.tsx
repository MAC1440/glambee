
"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { ClientsApi, ClientWithDetails } from "@/lib/api/clientsApi";
import { usePermissions } from "@/hooks/use-permissions";

export function GlobalClientSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ClientWithDetails[]>([]);
  console.log("Check results for global search: ", results)
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const inputRef = useRef<HTMLInputElement>(null);

  const { canRead, isAdmin } = usePermissions();
  const canSearchClients = isAdmin || canRead("clients");

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
    }
  }, [isOpen])

  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    if (!canSearchClients) {
      console.warn("User does not have permission to search clients");
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await ClientsApi.searchCustomers(query);
      setResults(searchResults);
      setIsOpen(true);
    } catch (error) {
      console.error("Error searching clients:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    // inputRef.current?.focus();
  };

  return (
    <div className="relative w-full items-center">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground"
              onClick={handleSearch}
            />
            <Input
              // ref={inputRef}
              type="tel"
              placeholder={canSearchClients ? "Search client by phone..." : "Search unavailable"}
              className="w-full rounded-lg bg-background pl-10 pr-10 border-2 border-primary ring-2 ring-primary/20"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!canSearchClients}
            />
            {query && (
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={clearSearch}
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
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex flex-col space-y-1 p-2">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            ) : results.length > 0 ? (
              results.map((customer: any) => (
                <Link
                  key={customer.id}
                  href={`/clients/${customer.id}`}
                  className="flex items-center gap-3 rounded-md p-2 hover:bg-accent"
                  onClick={() => setIsOpen(false)}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={customer.avatar || `https://picsum.photos/seed/${customer.name}/100`}
                      alt={customer.name}
                    />
                    <AvatarFallback>{customer.name?.[0] || "?"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {customer.phone_number}
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
