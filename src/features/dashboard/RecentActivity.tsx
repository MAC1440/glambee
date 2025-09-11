
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { appointments, mockCustomers } from "@/lib/placeholder-data";
import { UserPlus, CalendarPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const recentAppointments = appointments
  .slice(0, 3)
  .map((apt, index) => ({
    type: "appointment",
    id: apt.id,
    person: apt.customer.name,
    avatarSeed: apt.customer.name,
    details: `${apt.service} with ${apt.staff}`,
    time: formatDistanceToNow(
      new Date(new Date(apt.date).getTime() - index * 3 * 60 * 60 * 1000), // Simulate different times
      { addSuffix: true }
    ),
  }));

const newClients = mockCustomers
  .slice(4, 6)
  .map((client, index) => ({
    type: "client",
    id: client.id,
    person: client.name,
    avatarSeed: client.name,
    details: "New client registered",
    time: formatDistanceToNow(
      new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000), // Simulate registration 1-2 days ago
      { addSuffix: true }
    ),
  }));

const activities = [...recentAppointments, ...newClients].sort(
  () => Math.random() - 0.5
); // Randomize for demo

export function RecentActivity() {
  return (
    <div className="space-y-6">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-4">
          <Avatar className="h-10 w-10 border">
            <AvatarImage
              src={`https://picsum.photos/seed/${activity.avatarSeed}/100`}
              alt="Avatar"
            />
            <AvatarFallback>
              {activity.type === "appointment" ? (
                <CalendarPlus className="h-5 w-5 text-muted-foreground" />
              ) : (
                <UserPlus className="h-5 w-5 text-muted-foreground" />
              )}
            </AvatarFallback>
          </Avatar>
          <div className="grid gap-1 text-sm">
            <p className="font-medium">
              {activity.person}
            </p>
            <p className="text-muted-foreground">{activity.details}</p>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
