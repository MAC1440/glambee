
"use client";

import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { CustomToolbar } from './Toolbar';
import { useState, useMemo } from 'react';
import type { SlotInfo } from 'react-big-calendar';
import { staff } from '@/lib/placeholder-data';

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

const staffColors = [
  '#A7F3D0', '#BAE6FD', '#FBCFE8', '#FDE68A', '#DDD6FE', '#E5E7EB'
];
const darkStaffColors = [
  '#059669', '#0284C7', '#BE185D', '#D97706', '#6D28D9', '#4B5563'
];

export function CalendarView({ 
    events, 
    onSelectSlot, 
    onDrillDown,
    view: defaultView = Views.WEEK, 
    showToolbar = true 
}: { 
    events: any[], 
    onSelectSlot?: (slotInfo: SlotInfo) => void,
    onDrillDown?: (date: Date) => void,
    view?: View, 
    showToolbar?: boolean 
}) {
  const [view, setView] = useState<View>(defaultView);

  const staffColorMap = useMemo(() => {
    const map = new Map<string, { light: string, dark: string }>();
    staff.forEach((s, index) => {
        map.set(s.id, { 
            light: staffColors[index % staffColors.length],
            dark: darkStaffColors[index % darkStaffColors.length]
        });
    });
    return map;
  }, []);

  const eventStyleGetter = (event: any, start: Date, end: Date, isSelected: boolean) => {
    const staffId = event?.resource?.staffId;
    if (!staffId) return {};

    const colors = staffColorMap.get(staffId);
    if (!colors) return {};

    const style = {
        backgroundColor: colors.light,
        color: '#111827', // Dark text for light backgrounds
        borderRadius: '5px',
        border: '0px',
        display: 'block',
        opacity: 0.8,
    };
    
    // A simple way to detect dark mode without context.
    // In a real app, you might pass the theme down as a prop.
    if (document.documentElement.classList.contains('dark')) {
      style.backgroundColor = colors.dark;
      style.color = '#F9FAFB'; // Light text for dark backgrounds
    }

    return { style };
  }

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
        onDrillDown={onDrillDown}
        selectable={!!onSelectSlot}
        onSelectSlot={onSelectSlot}
        components={{
          toolbar: showToolbar ? CustomToolbar : () => null
        }}
        eventPropGetter={eventStyleGetter}
      />
    </div>
  );
}
