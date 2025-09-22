
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Automations } from "./Automations";
import { Broadcasts } from "./Broadcasts";
import { MessageTemplates } from "./MessageTemplates";
import { NotificationLogs } from "./NotificationLogs";

export function Engage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-left">
        <h1 className="text-4xl font-headline font-bold">Engage</h1>
        <p className="text-muted-foreground mt-2">
          Automate and manage customer engagement via SMS, Email, and Push Notifications.
        </p>
      </div>

      <Tabs defaultValue="automations">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="automations">Automations</TabsTrigger>
          <TabsTrigger value="broadcasts">Broadcasts</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="automations">
          <Card>
            <CardHeader>
              <CardTitle>Automated Messages</CardTitle>
              <CardDescription>
                Set up automated messages for key customer journey events.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Automations />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="broadcasts">
          <Card>
            <CardHeader>
              <CardTitle>Promotional Broadcasts</CardTitle>
              <CardDescription>
                Send targeted campaigns to specific customer segments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Broadcasts />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
              <CardDescription>
                Create and manage reusable message templates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MessageTemplates />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Notification Logs</CardTitle>
              <CardDescription>
                View a complete history of all sent messages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationLogs />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
