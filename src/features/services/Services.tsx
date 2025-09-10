import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

interface Service {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export function Services({
  services,
  error,
}: {
  services: Service[] | null;
  error: any;
}) {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-headline font-bold">Our Services</h1>
        <p className="text-muted-foreground mt-2">
          Indulge in our wide range of professional beauty and wellness
          services.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Fetching Services</AlertTitle>
          <AlertDescription>
            <pre className="mt-2 bg-background p-4 rounded-lg text-destructive-foreground">
              {JSON.stringify(error, null, 2)}
            </pre>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services &&
          services.map((service) => (
            <Card key={service.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">
                  {service.name}
                </CardTitle>
                <CardDescription>
                  Created: {new Date(service.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow"></CardContent>
              <CardFooter className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Last Updated: {new Date(service.updated_at).toLocaleDateString()}
                </p>
                <Button asChild>
                  <Link href="/book-appointment">Book Now</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
      </div>
    </div>
  );
}
