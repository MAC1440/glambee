import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { trends } from "@/lib/placeholder-data";
import { Sparkles } from "lucide-react";

export function Trends() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-headline font-bold">
          Discover the Latest Trends
        </h1>
        <p className="text-muted-foreground mt-2">
          Get inspired by the hottest looks and styles in the beauty world.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {trends.map((trend) => (
          <Card key={trend.id} className="flex flex-col">
            <CardHeader className="p-0">
              <div className="relative h-56 w-full">
                <Image
                  src={trend.image}
                  alt={trend.name}
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-grow pt-6">
              <CardTitle className="font-headline text-2xl">
                {trend.name}
              </CardTitle>
              <p className="mt-2 text-muted-foreground text-sm">
                {trend.description}
              </p>
            </CardContent>
            <CardFooter>
              <Button
                variant="ghost"
                className="text-primary hover:text-primary"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Learn More
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
