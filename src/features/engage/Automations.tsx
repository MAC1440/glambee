
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { automations } from "@/lib/placeholder-data";
import { Bell, Cog } from "lucide-react";

export function Automations() {
  const [automationStatus, setAutomationStatus] = React.useState(
    automations.reduce((acc, curr) => {
      acc[curr.id] = curr.active;
      return acc;
    }, {} as { [key: string]: boolean })
  );

  const toggleAutomation = (id: string) => {
    setAutomationStatus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {automations.map((automation) => (
        <Card key={automation.id} className="flex flex-col">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                 <Bell className="h-6 w-6 text-primary" />
                 <CardTitle>{automation.name}</CardTitle>
              </div>
              <Switch
                checked={automationStatus[automation.id]}
                onCheckedChange={() => toggleAutomation(automation.id)}
              />
            </div>
            <CardDescription>{automation.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow space-y-2">
            <div className="text-sm text-muted-foreground">
              Triggered by: <span className="font-medium text-foreground">{automation.event}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Channels:</span>
                {automation.channels.map(channel => (
                    <Badge key={channel} variant="secondary">{channel}</Badge>
                ))}
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 p-3">
            <Button variant="outline" className="w-full">
              <Cog className="mr-2 h-4 w-4" />
              Configure
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
