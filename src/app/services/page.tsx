import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { services } from "@/lib/placeholder-data";
import Link from "next/link";

export default function ServicesPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-headline font-bold">Our Services</h1>
        <p className="text-muted-foreground mt-2">
          Indulge in our wide range of professional beauty and wellness
          services.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.id} className="flex flex-col">
            <CardHeader className="p-0">
              <div className="relative h-48 w-full">
                <Image
                  src={service.image}
                  alt={service.name}
                  fill
                  className="object-cover rounded-t-lg"
                  data-ai-hint={service.dataAiHint}
                />
              </div>
            </CardHeader>
            <CardContent className="flex-grow pt-6">
              <CardTitle className="font-headline text-2xl">{service.name}</CardTitle>
              <p className="mt-2 text-muted-foreground">
                {service.description}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <div>
                <p className="font-bold text-lg">${service.price.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  {service.duration} min
                </p>
              </div>
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
