
"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { appointments, user } from "@/lib/placeholder-data";
import { performanceData } from "@/lib/performance-data";
import {
  ArrowLeft,
  Calendar,
  ClipboardList,
  Edit,
  FileText,
  Percent,
  Timer,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import type { StaffMember, Feedback } from "./Staff";
import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { StaffFormDialog } from "./StaffFormDialog";
import { LeaveRequestDialog } from "./LeaveRequestDialog";

export function StaffDetail({ staffMember: initialStaffMember }: { staffMember: StaffMember | undefined }) {
  const [staffMember, setStaffMember] = useState(initialStaffMember);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [newFeedbackNote, setNewFeedbackNote] = useState('');
  const { toast } = useToast();
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  if (!staffMember) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Staff Member Not Found</CardTitle>
          <CardDescription>
            The staff member you are looking for does not exist.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const staffAppointments = appointments.filter(
    (apt) => apt.staff === staffMember.name
  );
  const staffPerformance = performanceData.find(
    (p) => p.staffId === staffMember.id
  );

  const handleAddFeedback = () => {
    if (newFeedbackNote.trim() === '') {
        toast({ title: 'Note is empty', description: 'Please write a note before saving.', variant: 'destructive'});
        return;
    }
    const newFeedbackItem: Feedback = {
        id: `feedback_${Date.now()}`,
        date: new Date().toISOString(),
        author: user.name, // In a real app, this would be the logged in user
        note: newFeedbackNote,
    };
    setFeedback(prev => [newFeedbackItem, ...prev]);
    setNewFeedbackNote('');
    toast({ title: 'Feedback Added', description: 'The new note has been saved.'});
  }

  const handleSaveStaff = (updatedData: Omit<StaffMember, "id" | "salonId">) => {
    if (staffMember) {
      const updatedStaffMember = {
        ...staffMember,
        ...updatedData,
        skills: Array.isArray(updatedData.skills) ? updatedData.skills : [],
      };
      setStaffMember(updatedStaffMember);
      setIsEditFormOpen(false);
      toast({
        title: "Staff Updated",
        description: `${staffMember.name}'s profile has been updated.`,
      });
    }
  };

  const handleGenerateSalarySlip = () => {
    toast({
        title: "Salary Slip Generated",
        description: `A salary slip for ${staffMember.name} has been generated and is ready for download.`,
    });
  }

  const handleLeaveRequest = (values: {type: string; dates: {from: Date, to: Date}; reason: string}) => {
    console.log("Leave Request Submitted", values);
    toast({
      title: "Request Submitted",
      description: `Your ${values.type} request for ${staffMember.name} has been submitted for approval.`,
    });
    setIsLeaveDialogOpen(false);
  };


  return (
    <>
    <div className="flex flex-col gap-8">
      <div className="flex w-full items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/staff">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Staff List
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleGenerateSalarySlip}>
            <FileText className="mr-2 h-4 w-4" />
            Generate Salary Slip
          </Button>
           <Button variant="outline" onClick={() => setIsLeaveDialogOpen(true)}>
            <Calendar className="mr-2 h-4 w-4" />
            Request Leave/Loan
          </Button>
          <Button onClick={() => setIsEditFormOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          <Card>
            <CardHeader className="items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage
                  src={`https://picsum.photos/seed/${staffMember.name}/150`}
                  alt={staffMember.name}
                />
                <AvatarFallback className="text-3xl">
                  {staffMember.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl">{staffMember.name}</CardTitle>
              <CardDescription>{staffMember.role}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <div className="flex items-center gap-3">
                <ClipboardList className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">{staffMember.department}</span>
              </div>
              <div className="flex items-center gap-3">
                <Timer className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">{staffMember.shiftTimings}</span>
              </div>
              <div className="flex items-center gap-3">
                <Percent className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">{staffMember.commission}% Commission</span>
              </div>
              <div className="flex items-start gap-3">
                <Wrench className="h-5 w-5 text-muted-foreground mt-1" />
                <div className="flex flex-wrap gap-2">
                  {staffMember.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="appointments">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Staff Details</CardTitle>
                    <CardDescription>
                      Detailed history and performance for {staffMember.name}.
                    </CardDescription>
                  </div>
                  <TabsList>
                    <TabsTrigger value="appointments">Appointments</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="feedback">Feedback</TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>
              <CardContent>
                <TabsContent value="appointments">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staffAppointments.length > 0 ? (
                        staffAppointments.map((apt) => (
                          <TableRow key={apt.id}>
                            <TableCell>{apt.date}</TableCell>
                            <TableCell className="font-medium">
                              {apt.service}
                            </TableCell>
                            <TableCell>{apt.customer.name}</TableCell>
                            <TableCell className="text-right">
                              ${apt.price.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center h-24">
                            No appointment history for this staff member.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>
                <TabsContent value="performance">
                  {staffPerformance ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label>Total Sales</Label>
                                <p className="text-2xl font-bold">${staffPerformance.totalSales.toFixed(2)}</p>
                            </div>
                             <div className="space-y-1">
                                <Label>Services Completed</Label>
                                <p className="text-2xl font-bold">{staffPerformance.servicesCompleted}</p>
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label>Attendance Rate</Label>
                            <div className="flex items-center gap-2">
                                <Progress value={staffPerformance.attendanceRate} className="w-full" />
                                <span className="font-semibold">{staffPerformance.attendanceRate}%</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label>Average Client Rating</Label>
                             <div className="flex items-center gap-1">
                                <p className="text-2xl font-bold">{staffPerformance.avgRating.toFixed(1)}</p>
                                <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                            </div>
                        </div>
                    </div>
                  ) : (
                     <div className="text-center h-24 text-muted-foreground">No performance data available.</div>
                  )}
                </TabsContent>
                <TabsContent value="feedback">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="feedback-note">Add New Note</Label>
                      <Textarea 
                          id="feedback-note"
                          placeholder={`Type training note or feedback for ${staffMember.name}...`}
                          value={newFeedbackNote}
                          onChange={(e) => setNewFeedbackNote(e.target.value)}
                      />
                      <Button onClick={handleAddFeedback}>Save Note</Button>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-medium">History</h4>
                      {feedback.length > 0 ? (
                          feedback.map(item => (
                              <div key={item.id} className="p-4 rounded-lg border bg-muted/50">
                                  <p className="text-sm text-muted-foreground">
                                      <span className="font-semibold">{item.author}</span> on <span className="font-semibold">{format(parseISO(item.date), "MMMM d, yyyy 'at' p")}</span>
                                  </p>
                                  <p className="mt-2">{item.note}</p>
                              </div>
                          ))
                      ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">No feedback or training records yet.</p>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </div>
    </div>
    <StaffFormDialog 
        isOpen={isEditFormOpen}
        onOpenChange={setIsEditFormOpen}
        mode="edit"
        staffMember={staffMember}
        onSave={handleSaveStaff}
    />
    <LeaveRequestDialog
      isOpen={isLeaveDialogOpen}
      onOpenChange={setIsLeaveDialogOpen}
      onSave={handleLeaveRequest}
      staffName={staffMember.name}
    />
    </>
  );
}
