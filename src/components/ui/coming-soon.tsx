"use client";

import { Rocket } from "lucide-react";

type ComingSoonProps = {
  title?: string;
  description?: string;
};

export function ComingSoon({
  title = "Coming Soon!",
  description = "We're working hard to bring you this new feature. Stay tuned!",
}: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 border-2 border-dashed rounded-lg bg-muted/50">
      <div className="mb-4 animate-bounce">
        <Rocket className="h-16 w-16 text-primary" />
      </div>
      <h2 className="text-3xl font-bold font-headline mb-2">{title}</h2>
      <p className="max-w-md text-muted-foreground">{description}</p>
    </div>
  );
}
