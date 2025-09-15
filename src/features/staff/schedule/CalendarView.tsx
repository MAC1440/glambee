
"use client";

import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { CustomToolbar } from './Toolbar';
import { useState } from 'react';
import type { SlotInfo } from 'react-big-calendar';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export function CalendarView({ events, onSelectSlot, view: defaultView = Views.WEEK, showToolbar = true }: { events: any[], onSelectSlot?: (slotInfo: SlotInfo) => void, view?: View, showToolbar?: boolean }) {
  const [view, setView] = useState<View>(defaultView);

  return (
    <div className="h-[75vh]">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        view={view}
        onView={(view) => setView(view)}
        selectable={!!onSelectSlot}
        onSelectSlot={onSelectSlot}
        components={{
          toolbar: showToolbar ? CustomToolbar : () => null
        }}
        eventPropGetter={(event) => {
          return {
            className: 'text-sm',
          };
        }}
      />
    </div>
  );
}
