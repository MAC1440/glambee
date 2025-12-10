
"use client";

import React, { useState, useMemo } from "react";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CreditCard, Trash2, X, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { ServiceSelection, type CartItem } from "./ServiceSelection";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/use-permissions";
import { UnauthorizedAccess } from "@/components/ui/unauthorized-access";

type Customer = {
  id: string;
  phone_number?: string | null;
  name: string | null;
  email?: string | null;
  gender?: string | null;
  // dob: string; // Not available in current schema
};

export function Checkout({ client }: { client: Customer | undefined }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const { toast } = useToast();
  const { canUpdate } = usePermissions();
  const clientsModuleKey = "clients" as const;
  const hasAccess = canUpdate(clientsModuleKey);

  if (!client) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Client Not Found</CardTitle>
          <CardDescription>
            Please select a client to start a transaction.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild>
            <Link href="/clients">Go to Client List</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const handleAddToCart = (item: CartItem) => {
    // For promotions with non-numeric prices, we can't add them to the cart total
    if (typeof item.service.price !== 'number') {
        toast({
            title: "Cannot Add Promotion",
            description: "Promotional items must be applied manually at checkout.",
            variant: "default",
        })
        return;
    }
    setCart((prevCart) => [...prevCart, item]);
    toast({
        title: "Item Added",
        description: `${item.service.name} has been added to the cart.`,
    });
  };

  const handleRemoveFromCart = (index: number) => {
    const item = cart[index];
    setCart((prevCart) => prevCart.filter((_, i) => i !== index));
    toast({
        title: "Item Removed",
        description: `${item.service.name} has been removed from the cart.`,
        variant: "destructive"
    });
  };

  const handleClearCart = () => {
    setCart([]);
    setDiscountAmount(0);
    toast({
        title: "Cart Cleared",
        description: "All items have been removed from the cart.",
        style: {
          backgroundColor: "lightgreen",
          color: "black",
        }
    });
  }

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => total + (Number(item.service.price) || 0), 0);
  }, [cart]);

  const total = useMemo(() => {
    const finalTotal = subtotal - discountAmount;
    return finalTotal > 0 ? finalTotal : 0;
  }, [subtotal, discountAmount]);

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    if (value > subtotal) {
      setDiscountAmount(subtotal);
      toast({
        title: "Discount Limit Exceeded",
        description: `Discount cannot be greater than the subtotal of $${subtotal.toFixed(2)}.`,
        variant: "destructive",
      });
    } else {
      setDiscountAmount(value);
    }
  };

  if (!hasAccess) {
    return <UnauthorizedAccess moduleName="Checkout" />;
  }
  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/clients/${(client?.id)}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">Checkout for {client.name || 'Unknown Client'}</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow min-h-0">
        {/* Left Column: Service Selection */}
        <ServiceSelection onAddToCart={handleAddToCart} existingItems={cart} />

        {/* Right Column: Order Summary */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>Review the items before payment.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow space-y-4 overflow-y-auto">
            <ScrollArea className="h-[calc(100%-250px)] pr-4">
              {cart.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No items in cart.
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between items-start text-sm p-2 rounded-md bg-muted/50">
                        <div>
                            <p className="font-medium">{item.service.name}</p>
                             {item.artist && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {item.artist.label}
                                </p>
                             )}
                        </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium">${(Number(item.service.price) || 0).toFixed(2)}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveFromCart(index)}>
                            <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                 <Label htmlFor="discount" className="text-muted-foreground">Discount</Label>
                 <div className="flex items-center gap-1 w-24">
                    <span className="text-muted-foreground text-sm">-$</span>
                    <Input 
                        id="discount"
                        type="number"
                        value={discountAmount}
                        onChange={handleDiscountChange}
                        className="h-8 text-right"
                        placeholder="0.00"
                        max={subtotal}
                    />
                 </div>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="grid grid-cols-2 gap-2 mt-auto pt-6 bg-muted/50">
            <Button size="lg" className="col-span-2" disabled={cart.length === 0}>
              <CreditCard className="mr-2" /> Pay ${total.toFixed(2)}
            </Button>
            <Button variant="destructive" className="col-span-2" onClick={handleClearCart}>
              <Trash2 className="mr-2 h-4 w-4" /> Clear Cart
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
