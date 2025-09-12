
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";

type TimeSelectionProps = {
  onSelectTime: (date: Date) => void;
};

export function TimeSelection({ onSelectTime }: TimeSelectionProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
        setDate(selectedDate);
        onSelectTime(selectedDate);
    }
  }

  return (
    <Card>
      <CardContent className="p-4 flex justify-center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          className="rounded-md border"
        />
      </CardContent>
    </Card>
  );
}
