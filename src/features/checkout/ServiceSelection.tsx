
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ServicesApi, type ServiceWithStaff } from "@/lib/api/servicesApi";
import { StaffApi, type StaffWithCategories } from "@/lib/api/staffApi";


type Service = ServiceWithStaff & {
  description?: string;
  originalPrice?: number | null;
  image?: string;
  category?: "Service" | "Deal" | "Promotion";
  includedServices?: { value: string; label: string }[];
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

export function ServiceSelection({ onAddToCart, buttonText = "Add to Cart" }: ServiceSelectionProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<ArtistOption | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const sessionData = localStorage.getItem("session");
  const salonId = sessionData ? JSON.parse(sessionData).salonId : null;

  // Fetch services on component mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const response = await ServicesApi.getServices({ limit: 100, salonId });
        const servicesWithDefaults = response.data.map(service => ({
          ...service,
          description: service.name, // Use name as description if no description
          originalPrice: null,
          image: `https://picsum.photos/seed/${service.name}/200`,
          category: "Service" as const,
          includedServices: [],
        }));
        setServices(servicesWithDefaults);
      } catch (error) {
        console.error("Error fetching services:", error);
        setServices([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  const selectedService = useMemo(() => {
    return services.find(s => s.id === selectedServiceId);
  }, [selectedServiceId, services]);

  const [staffForService, setStaffForService] = useState<any[]>([]);

  // Fetch staff for selected service
  useEffect(() => {
    const fetchStaffForService = async () => {
      if (!selectedService?.id) {
        setStaffForService([]);
        return;
      }

      try {
        const staff = await ServicesApi.getStaffForService(selectedService.id, salonId || '');
        setStaffForService(staff);
      } catch (error) {
        console.error("Error fetching staff for service:", error);
        setStaffForService([]);
      }
    };

    fetchStaffForService();
  }, [selectedService?.id]);

  const artistOptions = useMemo(() => {
    return staffForService.map(staff => ({
      value: staff.id,
      label: staff.name || 'Unknown Staff'
    }));
  }, [staffForService]);

  // Group services for the dropdown
  const groupedOptions = useMemo(() => {
    const individualServices = services
      .filter((s) => s.category === "Service" || !s.category)
      .map((s) => ({ value: s.id, label: s.name }));
    
    const packageDeals = services
      .filter((s) => s.category === "Deal")
      .map((s) => ({ value: s.id, label: s.name }));

    const groups = [];
    if (packageDeals.length > 0) {
      groups.push({ label: "Package Deals", options: packageDeals });
    }
    if (individualServices.length > 0) {
      groups.push({ label: "Individual Services", options: individualServices });
    }
    return groups;
  }, [services]);

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

  if (isLoading) {
    return (
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Select Service</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow p-4 space-y-4">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading services...</p>
          </div>
        </CardContent>
      </Card>
    );
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
                  {groupedOptions.length > 0 ? (
                    groupedOptions.map(group => (
                        <div key={group.label} className="p-2">
                            <p className="text-xs text-muted-foreground px-2 font-semibold">{group.label}</p>
                             {group.options.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </div>
                    ))
                  ) : (
                    <div className="p-2 text-center text-muted-foreground">
                      No services available
                    </div>
                  )}
              </SelectContent>
          </Select>
        </div>

        {selectedService && (
          <div className="space-y-2">
            <div className="text-sm">
              <p className="font-medium">{selectedService.name}</p>
              <p className="text-muted-foreground">${selectedService.price} • {selectedService.duration || 30} min</p>
            </div>
          </div>
        )}

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
            disabled={!selectedService || isLoading}
            onClick={handleAddClick}
        >
            {isLoading ? "Loading..." : buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}
