
"use client";

import React, { useState, useMemo } from "react";
import Select from "react-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { services as allServices } from "@/lib/placeholder-data";

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
    artist: ArtistOption | null;
}

type ServiceSelectionProps = {
  onAddToCart: (item: CartItem) => void;
};

// Group services for the dropdown
const groupedOptions = [
  {
    label: "Package Deals",
    options: allServices
      .filter((s) => s.category === "Deal")
      .map((s) => ({ value: s, label: s.name })),
  },
  {
    label: "Individual Services",
    options: allServices
      .filter((s) => s.category === "Service")
      .map((s) => ({ value: s, label: s.name })),
  },
];


export function ServiceSelection({ onAddToCart }: ServiceSelectionProps) {
  const [selectedService, setSelectedService] = useState<ServiceOption | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<ArtistOption | null>(null);

  const artistOptions = useMemo(() => {
    return selectedService?.value.artists || [];
  }, [selectedService]);

  const handleServiceChange = (option: ServiceOption | null) => {
    setSelectedService(option);
    setSelectedArtist(null); // Reset artist when service changes
  };
  
  const handleAddClick = () => {
    if (selectedService) {
        onAddToCart({ service: selectedService.value, artist: selectedArtist });
        setSelectedService(null);
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
            options={groupedOptions}
            value={selectedService}
            onChange={handleServiceChange}
            placeholder="Search for a service or deal..."
            isClearable
          />
        </div>

        {selectedService && artistOptions.length > 0 && (
          <div className="space-y-2">
            <Label>Artist (Optional)</Label>
            <Select
              options={artistOptions}
              value={selectedArtist}
              onChange={(option) => setSelectedArtist(option)}
              placeholder="Select an artist..."
              isClearable
            />
          </div>
        )}
        
        <Button 
            className="w-full"
            disabled={!selectedService}
            onClick={handleAddClick}
        >
            Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
}
