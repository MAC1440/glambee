
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RolePermissions } from "./RolePermissions";
import { StaffRoles } from "./StaffRoles";

export function Roles() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-left">
        <h1 className="text-4xl font-headline font-bold">Roles & Permissions</h1>
        <p className="text-muted-foreground mt-2">
          Define roles and manage permissions for your staff members.
        </p>
      </div>

      <Tabs defaultValue="assignments" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assignments">Staff Assignments</TabsTrigger>
          <TabsTrigger value="management">Role Management</TabsTrigger>
        </TabsList>
        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Staff Role Assignments</CardTitle>
              <CardDescription>
                Assign roles to each staff member to control their access level.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StaffRoles />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="management">
          <Card>
            <CardHeader>
              <CardTitle>Role Management</CardTitle>
              <CardDescription>
                Define roles and their permissions across the application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RolePermissions />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
