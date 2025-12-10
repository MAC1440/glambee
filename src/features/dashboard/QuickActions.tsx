import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface QuickActionsProps {
  canCreateSchedule: boolean;
  canUpdateSchedule: boolean;
}
export function QuickActions({canCreateSchedule, canUpdateSchedule}: QuickActionsProps) {
  return (
    <>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {(!canCreateSchedule || !canUpdateSchedule) ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button style={{cursor: 'not-allowed', opacity: 0.7}}>
                  Book New Appointment
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>You need create or update schedule permissions to book appointments</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button asChild>
            <Link href="/appointments">Book New Appointment</Link>
          </Button>
        )}
        <Button asChild>
          <Link href="/services">Manage Services</Link>
        </Button>
        <Button asChild>
          <Link href="/staff/schedule">View Schedule</Link>
        </Button>
      </CardContent>
    </>
  );
}
