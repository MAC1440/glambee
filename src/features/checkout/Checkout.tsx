
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { services } from "@/lib/placeholder-data";
import { ArrowLeft, CreditCard, Gift, Percent, Tag, Trash2, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type Customer = {
  id: string;
  phone: string;
  name: string;
  email: string;
  gender: string;
  dob: string;
};

type Service = {
  id: string;
  name: string;
  description: string;
  price: number | string;
  originalPrice: number | null;
  duration: number | null;
  image: string;
  category: "Service" | "Deal" | "Promotion";
};

export function Checkout({ client }: { client: Customer | undefined }) {
  const [cart, setCart] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  if (!client) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Client Not Found</CardTitle>
          <CardDescription>
            Please select a client to start a transaction.
          </CardDescription>
          <CardFooter>
            <Button asChild>
                <Link href="/clients">Go to Client List</Link>
            </Button>
          </CardFooter>
        </CardHeader>
      </Card>
    );
  }
  
  const subtotal = 0;
  const discountAmount = 0;
  const total = 0;

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) && service.category !== 'Promotion'
  );

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-4rem)]">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href={`/clients/${encodeURIComponent(client.email)}`}>
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <h1 className="text-xl font-semibold">Checkout for {client.name}</h1>
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow">
        {/* Left Column: Service Selection */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Select Services</CardTitle>
            <Input
              placeholder="Search services or deals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardHeader>
          <CardContent className="flex-grow p-0">
            <ScrollArea className="h-[50vh] p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredServices.map((service) => (
                  <Card key={service.id} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <CardTitle className="text-base flex justify-between items-start">
                        {service.name}
                         <Badge variant={service.category === 'Deal' ? 'secondary' : 'default'} className="whitespace-nowrap">
                            {service.category}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                        <p className="line-clamp-2">{service.description}</p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between items-center">
                      <div className="font-bold text-lg">
                        {typeof service.price === 'number' ? `$${service.price.toFixed(2)}` : 'Promo'}
                      </div>
                      <Button size="sm">Add to Cart</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right Column: Order Summary */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>Review the items before payment.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow space-y-4">
            <ScrollArea className="h-[40vh] pr-4">
                {cart.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        No items in cart.
                    </div>
                ): (
                    <div className="space-y-4">
                        {/* Cart items will be rendered here */}
                    </div>
                )}
            </ScrollArea>
            <Separator />
            <div className="space-y-2">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                    <span>Discount</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                </div>
            </div>
            <div className="flex gap-2">
                <Input placeholder="Discount Code" className="flex-grow" />
                <Button variant="secondary"><Tag className="mr-2 h-4 w-4" />Apply</Button>
            </div>
          </CardContent>
          <CardFooter className="grid grid-cols-3 gap-2">
            <Button size="lg" className="col-span-3">
              <CreditCard className="mr-2" /> Pay ${total.toFixed(2)}
            </Button>
             <Button variant="outline" size="sm"><Percent className="mr-2 h-4 w-4" />Add Custom Discount</Button>
             <Button variant="outline" size="sm"><Gift className="mr-2 h-4 w-4" />Use Gift Card</Button>
             <Button variant="destructive" size="sm"><X className="mr-2 h-4 w-4" />Clear Cart</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

    