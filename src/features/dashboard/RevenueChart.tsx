
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useMemo } from 'react';
import { format, eachDayOfInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parse, parseISO, getHours } from 'date-fns';
import type { Appointment } from "@/lib/api/servicesApi";

const groupDataByDay = (appointments: Appointment[], period: "today" | "week" | "month") => {
    if (!appointments.length) return [];
    
    let interval;
    const today = new Date();
    if (period === 'week') {
        interval = { start: startOfWeek(today, { weekStartsOn: 1 }), end: endOfWeek(today, { weekStartsOn: 1 }) };
    } else { // month
        interval = { start: startOfMonth(today), end: endOfMonth(today) };
    }

    const days = eachDayOfInterval(interval);
    const dailyData: { [key: string]: number } = {};

    days.forEach(day => {
        dailyData[format(day, 'yyyy-MM-dd')] = 0;
    });

    appointments.forEach(apt => {
        const day = format(parseISO(apt.date), 'yyyy-MM-dd');
        if (dailyData[day] !== undefined) {
            dailyData[day] += apt.price;
        }
    });

    return Object.keys(dailyData).map(date => ({
        name: format(parseISO(date), period === 'week' ? 'EEE' : 'd'),
        revenue: dailyData[date]
    }));
};

const groupDataByWeek = (appointments: Appointment[]) => {
    if (!appointments.length) return [];
    
    const weeklyData: { [key: string]: number } = {};

    appointments.forEach(apt => {
        const week = format(startOfWeek(parseISO(apt.date), { weekStartsOn: 1 }), 'MMM d');
        if (!weeklyData[week]) {
            weeklyData[week] = 0;
        }
        weeklyData[week] += apt.price;
    });

    return Object.keys(weeklyData).map(week => ({
        name: week,
        revenue: weeklyData[week]
    }));
};

const groupDataByHour = (appointments: Appointment[]) => {
    if (!appointments.length) return [];

    const hourlyData: { [key: number]: number } = {};
    for (let i = 8; i <= 20; i++) { // From 8 AM to 8 PM
        hourlyData[i] = 0;
    }

    appointments.forEach(apt => {
        try {
            const appointmentDate = parse(apt.time, 'h:mm a', new Date());
            const hour = getHours(appointmentDate);
            if (hourlyData[hour] !== undefined) {
                hourlyData[hour] += apt.price;
            }
        } catch (error) {
            console.error("Error parsing time:", apt.time, error);
        }
    });

    return Object.keys(hourlyData).map(hourStr => {
        const hour = parseInt(hourStr);
        return {
            name: format(new Date(2000, 0, 1, hour), 'ha'), // 'ha' for '9am', '12pm' etc.
            revenue: hourlyData[hour]
        };
    });
}


export function RevenueChart({ appointments, period }: { appointments: Appointment[]; period: "today" | "week" | "month" }) {

  const chartData = useMemo(() => {
    if (period === 'today') {
        return groupDataByHour(appointments);
    }
    if (period === 'week') {
        return groupDataByDay(appointments, 'week');
    }
    if (period === 'month') {
        return groupDataByWeek(appointments);
    }
    return [];

  }, [appointments, period]);

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={300}>
      <BarChart data={chartData}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
            cursor={{ fill: 'hsl(var(--muted))' }}
            contentStyle={{ 
                background: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
            }}
        />
        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
