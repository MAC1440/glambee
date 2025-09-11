import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { staff, appointments } from "@/lib/placeholder-data";
import { PlusCircle, TrendingUp, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Staff() {
  const getDepartmentColor = (department: string) => {
    switch (department.toLowerCase()) {
      case "stylist":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
      case "nail artist":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300";
      case "receptionist":
        return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
      case "assistant":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300";
      default:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300";
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-4xl font-headline font-bold">Staff Management</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your team members.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2" />
          Add Staff Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Staff</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Appointments Today</TableHead>
                <TableHead>Total Revenue Generated</TableHead>
                <TableHead className="text-right">Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((member) => {
                const memberAppointments = appointments.filter(
                  (apt) => apt.staff === member.name
                );
                const todayAppointments = memberAppointments.filter(
                  (apt) => apt.date === new Date().toISOString().slice(0, 10)
                ).length;
                const totalRevenue = memberAppointments.reduce(
                  (sum, apt) => sum + apt.price,
                  0
                );
                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage
                            src={`https://picsum.photos/seed/${member.name}/100`}
                            alt="Avatar"
                          />
                          <AvatarFallback>
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{member.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <Badge
                          variant="outline"
                          className={getDepartmentColor(member.department)}
                        >
                          {member.department}
                        </Badge>
                    </TableCell>
                    <TableCell>{member.department.toLowerCase().includes('artist') || member.department.toLowerCase().includes('stylist') ? todayAppointments : 'N/A'}</TableCell>
                    <TableCell>{member.department.toLowerCase().includes('artist') || member.department.toLowerCase().includes('stylist') ? `$${totalRevenue.toFixed(2)}` : 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        View Stats
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
