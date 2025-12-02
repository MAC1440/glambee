
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ServicesApi, type ServiceWithStaff } from "@/lib/api/servicesApi";
import { StaffApi, type StaffWithCategories } from "@/lib/api/staffApi";
import { DealsApi } from "@/lib/api/dealsApi";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";


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
  existingItems?: CartItem[]; // To prevent duplicates
  salonId?: string | null;
};

export function ServiceSelection({ onAddToCart, buttonText = "Add to Cart", existingItems = [], salonId: propSalonId }: ServiceSelectionProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<ArtistOption | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [deals, setDeals] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const sessionData = localStorage.getItem("session");
  const salonId = propSalonId || (sessionData ? JSON.parse(sessionData).salonId : null);

  // Fetch services and deals on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch services
        const servicesResponse = await ServicesApi.getServices({ limit: 100, salonId });
        const servicesWithDefaults = servicesResponse.data.map(service => ({
          ...service,
          description: service.name,
          originalPrice: null,
          image: `https://picsum.photos/seed/${service.name}/200`,
          category: "Service" as const,
          includedServices: [],
        }));
        setServices(servicesWithDefaults);

        // Fetch deals
        if (salonId) {
          const dealsResponse = await DealsApi.getDeals({ salonId, limit: 100 });
          
          // Fetch services for each deal
          const dealsWithServices = await Promise.all(
            dealsResponse.data.map(async (deal) => {
              // Fetch services included in this deal
              const { data: dealServices } = await supabase
                .from('salons_deals_services')
                .select(`
                  salon_service_id,
                  service:salons_services(id, name, price, time)
                `)
                .eq('deal_id', deal.id);

              const includedServices = dealServices?.map(ds => ({
                value: ds.service?.id || '',
                label: ds.service?.name || ''
              })) || [];

              // Calculate total duration from included services
              // Helper function to parse time string to minutes
              const parseTimeToMinutes = (timeString: string): number => {
                if (!timeString) return 30;
                const match = timeString.match(/(\d+)\s*(min|minutes?|m)/i);
                if (match) return parseInt(match[1], 10);
                const numMatch = timeString.match(/(\d+)/);
                if (numMatch) return parseInt(numMatch[1], 10);
                return 30;
              };
              
              const totalDuration = dealServices?.reduce((sum, ds) => {
                if (ds.service?.time) {
                  const duration = parseTimeToMinutes(ds.service.time);
                  return sum + duration;
                }
                return sum;
              }, 0) || 30;

              return {
                id: deal.id,
                name: deal.title || deal.popup_title || 'Deal',
                price: deal.discounted_price || deal.price || 0,
                duration: totalDuration,
                description: deal.description || deal.title,
                originalPrice: deal.price,
                image: deal.media_url || `https://picsum.photos/seed/${deal.title}/200`,
                category: "Deal" as const,
                includedServices,
                salon_id: deal.salon_id,
                category_id: null,
                gender: null,
                starting_from: null,
                has_range: false,
                time: `${totalDuration} minutes`,
                created_at: deal.created_at,
                updated_at: deal.updated_at,
                staff: [],
              } as Service;
            })
          );
          
          setDeals(dealsWithServices);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setServices([]);
        setDeals([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [salonId]);

  const selectedService = useMemo(() => {
    const allItems = [...services, ...deals];
    return allItems.find(s => s.id === selectedServiceId);
  }, [selectedServiceId, services, deals]);

  const [staffForService, setStaffForService] = useState<any[]>([]);

  // Fetch staff for selected service or deal
  useEffect(() => {
    const fetchStaffForService = async () => {
      if (!selectedService?.id) {
        setStaffForService([]);
        return;
      }

      try {
        let staff: any[] = [];
        
        // Check if it's a deal or a regular service
        if (selectedService.category === "Deal") {
          // For deals, get staff based on categories of included services
          staff = await ServicesApi.getStaffForDeal(selectedService.id, salonId || '');
        } else {
          // For regular services, get staff based on service category
          staff = await ServicesApi.getStaffForService(selectedService.id, salonId || '');
        }
        
        setStaffForService(staff);
      } catch (error) {
        console.error("Error fetching staff for service:", error);
        setStaffForService([]);
      }
    };

    fetchStaffForService();
  }, [selectedService?.id, selectedService?.category, salonId]);

  const artistOptions = useMemo(() => {
    return staffForService.map(staff => ({
      value: staff.id,
      label: staff.name || 'Unknown Staff'
    }));
  }, [staffForService]);

  // Group services and deals for the dropdown
  const groupedOptions = useMemo(() => {
    const individualServices = services
      .filter((s) => s.category === "Service" || !s.category)
      .map((s) => ({ value: s.id, label: s.name }));
    
    const packageDeals = deals
      .filter((s) => s.category === "Deal")
      .map((s) => ({ value: s.id, label: s.name }));

    const groups = [];
    if (packageDeals.length > 0) {
      groups.push({ label: "Deals", options: packageDeals });
    }
    if (individualServices.length > 0) {
      groups.push({ label: "Individual Services", options: individualServices });
    }
    return groups;
  }, [services, deals]);

  console.log("Grouped options: ", groupedOptions)

  const handleServiceChange = (serviceId: string | null) => {
    setSelectedServiceId(serviceId);
    setSelectedArtist(null); // Reset artist when service changes
  };
  
  const handleAddClick = () => {
    if (selectedService) {
      // Check if service already exists in cart
      const isDuplicate = existingItems.some(item => item.service.id === selectedService.id);
      
      if (isDuplicate) {
        toast({
          title: "Service Already Added",
          description: `${selectedService.name} is already selected.`,
          variant: "destructive",
        });
        return;
      }

      onAddToCart({ service: selectedService, artist: selectedArtist });
      setSelectedServiceId(null);
      setSelectedArtist(null);
      toast({
        title: "Service Added",
        description: `${selectedService.name} has been selected.`,
        style: {
          backgroundColor: "lightgreen",
          color: "black",
        }
      });
    }
  }

  if (isLoading) {
    return (
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Select Service or Deal</CardTitle>
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
        <CardTitle>Select Service or Deal</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-4 space-y-4">
        <div className="space-y-2">
          <Label>Service or Deal</Label>
          <Select
            onValueChange={(value) => handleServiceChange(value)}
            value={selectedServiceId || ""}
          >
              <SelectTrigger className="w-full">
                  <SelectValue placeholder="Search for a service or deal..." />
              </SelectTrigger>
              <SelectContent className="w-[var(--radix-select-trigger-width)] max-h-[300px]">
                  {groupedOptions.length > 0 ? (
                    groupedOptions.map(group => (
                      <div key={group.label}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          {group.label}
                        </div>
                        {group.options.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
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
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an artist..." />
              </SelectTrigger>
              <SelectContent className="w-[var(--radix-select-trigger-width)] max-h-[200px]">
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
