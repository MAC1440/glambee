
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

type ClientNotFoundProps = {
  phone: string;
  onRegister: (newCustomer: { name: string; email: string }) => void;
  onBack: () => void;
};

export function ClientNotFound({
  phone,
  onRegister,
  onBack,
}: ClientNotFoundProps) {
  const { toast } = useToast();

  const handleRegister = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newCustomer = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
    };
    onRegister(newCustomer);
    toast({
      title: "Customer Registered",
      description: `${newCustomer.name} has been added to your client list.`,
    });
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="w-full max-w-2xl flex justify-start">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Search
        </Button>
      </div>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>New Client</CardTitle>
          <CardDescription>
            The phone number <strong>{phone}</strong> is not in your records. Please
            register the new client.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" placeholder="Jane Doe" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="jane@example.com"
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Register Client
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
