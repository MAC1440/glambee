
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, set } from "date-fns";

type TimeSelectionProps = {
  onSelectTime: (date: Date) => void;
};

// Generate time slots from 9 AM to 5 PM every 30 minutes
const generateTimeSlots = () => {
  const slots = [];
  for (let i = 9; i <= 23; i++) {
    slots.push(format(set(new Date(), { hours: i, minutes: 0 }), 'p'));
    if (i < 24) {
      slots.push(format(set(new Date(), { hours: i, minutes: 30 }), 'p'));
    }
  }
  return slots;
};
const timeSlots = generateTimeSlots();


export function TimeSelection({ onSelectTime }: TimeSelectionProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleTimeSelect = (time: string) => {
    if (date) {
      setSelectedTime(time);
      const [hour, minutePart] = time.split(':');
      const [minute, ampm] = minutePart.split(' ');
      let hourNumber = parseInt(hour, 10);
      if (ampm === 'PM' && hourNumber !== 12) {
        hourNumber += 12;
      }
      if (ampm === 'AM' && hourNumber === 12) {
        hourNumber = 0;
      }

      const newDate = set(date, { hours: hourNumber, minutes: parseInt(minute) });
      onSelectTime(newDate);
    }
  };

  return (
    <Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <div>
          <CardHeader className="p-2">
            <CardTitle>1. Select a Date</CardTitle>
          </CardHeader>
          <CardContent className="p-2 flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </div>
        <div>
          <CardHeader className="p-2">
            <CardTitle>2. Select a Time</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <ScrollArea className="h-72 w-full rounded-md border p-4">
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map(time => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    onClick={() => handleTimeSelect(time)}
                    disabled={!date}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
