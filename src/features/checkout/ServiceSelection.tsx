
"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { services as allServices } from "@/lib/placeholder-data";
import { MultiSelect } from "@/components/ui/multi-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


type Service = {
  id: string;
  name: string;
  description: string;
  price: number | string;
  originalPrice: number | null;
  duration: number | null;
  image: string;
  category: "Service" | "Deal" | "Promotion";
  includedServices?: { value: string; label: string }[];
  artists?: { value: string; label: string }[];
};

type ArtistOption = {
  value: string;
  label: string;
};

type ServiceOption = {
  value: Service;
  label: string;
};

export type CartItem = {
    service: Service;
    artist?: ArtistOption | null;
}

type ServiceSelectionProps = {
  onAddToCart: (item: CartItem) => void;
  buttonText?: string;
};

// Group services for the dropdown
const groupedOptions = [
  {
    label: "Package Deals",
    options: allServices
      .filter((s) => s.category === "Deal")
      .map((s) => ({ value: s.id, label: s.name })),
  },
  {
    label: "Individual Services",
    options: allServices
      .filter((s) => s.category === "Service")
      .map((s) => ({ value: s.id, label: s.name })),
  },
];


export function ServiceSelection({ onAddToCart, buttonText = "Add to Cart" }: ServiceSelectionProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<ArtistOption | null>(null);

  const selectedService = useMemo(() => {
    return allServices.find(s => s.id === selectedServiceId);
  }, [selectedServiceId]);

  const artistOptions = useMemo(() => {
    return selectedService?.artists || [];
  }, [selectedService]);

  const handleServiceChange = (serviceId: string | null) => {
    setSelectedServiceId(serviceId);
    setSelectedArtist(null); // Reset artist when service changes
  };
  
  const handleAddClick = () => {
    if (selectedService) {
        onAddToCart({ service: selectedService, artist: selectedArtist });
        setSelectedServiceId(null);
        setSelectedArtist(null);
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Select Service</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-4 space-y-4">
        <div className="space-y-2">
          <Label>Service or Deal</Label>
          <Select
            onValueChange={(value) => handleServiceChange(value)}
            value={selectedServiceId || ""}
          >
              <SelectTrigger>
                  <SelectValue placeholder="Search for a service or deal..." />
              </SelectTrigger>
              <SelectContent>
                  {groupedOptions.map(group => (
                      <div key={group.label} className="p-2">
                          <p className="text-xs text-muted-foreground px-2 font-semibold">{group.label}</p>
                           {group.options.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                              </SelectItem>
                          ))}
                      </div>
                  ))}
              </SelectContent>
          </Select>
        </div>

        {selectedService && artistOptions.length > 0 && (
          <div className="space-y-2">
            <Label>Artist (Optional)</Label>
            <Select
              onValueChange={(value) => setSelectedArtist(artistOptions.find(a => a.value === value) || null)}
              value={selectedArtist?.value || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an artist..." />
              </SelectTrigger>
              <SelectContent>
                {artistOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <Button 
            className="w-full"
            disabled={!selectedService}
            onClick={handleAddClick}
        >
            {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}
