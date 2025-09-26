
'use client';

import { useState, useMemo } from 'react';
import { CalendarView } from '../staff/schedule/CalendarView';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, isSameDay } from 'date-fns';
import type { ScheduleAppointment } from '@/lib/schedule-data';
import type { SlotInfo, View } from 'react-big-calendar';
import { Views } from 'react-big-calendar';

export function DashboardCalendar({ allAppointments, period }: { allAppointments: ScheduleAppointment[], period: 'today' | 'week' | 'month' }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAppointments, setSelectedAppointments] = useState<ScheduleAppointment[]>([]);

  const calendarEvents = useMemo(() => {
    return allAppointments.map((apt) => ({
      title: apt.service,
      start: apt.start,
      end: apt.end,
      resource: apt,
    }));
  }, [allAppointments]);

  const handleDateClick = (slotInfo: SlotInfo | Date) => {
    const date = slotInfo instanceof Date ? slotInfo : slotInfo.start;
    const appointmentsForDay = allAppointments.filter(apt => isSameDay(apt.start, date));
    if (appointmentsForDay.length > 0) {
      setSelectedDate(date);
      setSelectedAppointments(appointmentsForDay.sort((a, b) => a.start.getTime() - b.start.getTime()));
      setIsModalOpen(true);
    }
  };
  
  const calendarView = useMemo(() => {
      switch(period) {
          case 'today': return Views.DAY;
          case 'week': return Views.WEEK;
          case 'month': return Views.MONTH;
          default: return Views.MONTH;
      }
  }, [period]);

  return (
    <>
      <CalendarView 
        events={calendarEvents} 
        view={calendarView}
        onSelectSlot={handleDateClick}
        onDrillDown={handleDateClick}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Appointments for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}</DialogTitle>
            <DialogDescription>
              Here is a list of all appointments scheduled for this day.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedAppointments.length > 0 ? (
                  selectedAppointments.map((apt) => (
                    <TableRow key={apt.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                            <AvatarImage src={apt.customerAvatar} alt="Avatar" />
                            <AvatarFallback>{apt.customerName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{apt.customerName}</div>
                        </div>
                      </TableCell>
                      <TableCell>{apt.service}</TableCell>
                      <TableCell className="text-right">{format(apt.start, 'p')}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">No appointments for this day.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
