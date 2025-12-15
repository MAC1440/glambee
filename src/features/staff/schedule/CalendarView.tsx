
"use client";

import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { CustomToolbar } from './Toolbar';
import { useState, useMemo, useCallback } from 'react';
import type { SlotInfo, NavigateAction } from 'react-big-calendar';
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
  const [date, setDate] = useState(new Date());

  const handleNavigate = useCallback((newDate: Date, view: View, action: NavigateAction) => {
    setDate(newDate);
  }, []);

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

  // const { min, max } = useMemo(() => {
  //   const today = new Date();
  //   const min = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0, 0);
  //   const max = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 30, 0);
  //   return { min, max };
  // }, []);

  const eventStyleGetter = (event: any, start: Date, end: Date, isSelected: boolean) => {
    const isTemporary = event?.resource?.isTemporary;

    if (isTemporary) {
      const temporaryStyle = {
        backgroundColor: 'transparent',
        color: 'hsl(var(--foreground))',
        border: '2px dashed hsl(var(--primary))',
        borderRadius: '5px',
        display: 'block',
        opacity: 0.7,
      };
      return { style: temporaryStyle };
    }

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
        date={date}
        onView={(view) => setView(view)}
        onNavigate={handleNavigate}
        onDrillDown={onDrillDown}
        selectable={!!onSelectSlot}
        onSelectSlot={onSelectSlot}
        // min={min}
        // max={max}
        components={{
          toolbar: showToolbar ? CustomToolbar : () => null
        }}
        eventPropGetter={eventStyleGetter}
      />
    </div>
  );
}
