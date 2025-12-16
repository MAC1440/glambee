
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useMemo } from 'react';
import { format, eachDayOfInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parse, getHours, getWeekOfMonth, parseISO, isSameDay } from 'date-fns';
// import { AppointmentWithDetails } from "@/lib/api/appointmentsApi";

const groupDataByDay = (appointments: any[]) => {
    const today = new Date();
    const interval = { start: startOfWeek(today, { weekStartsOn: 1 }), end: endOfWeek(today, { weekStartsOn: 1 }) };
    const weekDays = eachDayOfInterval(interval);

    const dailyData = weekDays.map(day => ({
        name: format(day, 'EEE'),
        revenue: 0,
    }));

    appointments.forEach(apt => {
        const appointmentDate = parseISO(apt.date);
        const dayOfWeek = appointmentDate.getDay();
        const dayIndex = weekDays.findIndex(day => isSameDay(day, appointmentDate));

        if (dayIndex !== -1) {
            dailyData[dayIndex].revenue += apt.price;
        }
    });

    return dailyData;
};

const groupDataByWeek = (appointments: any[]) => {
    const today = new Date();
    const start = startOfMonth(today);
    const end = endOfMonth(today);

    const weeklyData: { [key: string]: number } = {
        "Week 1": 0,
        "Week 2": 0,
        "Week 3": 0,
        "Week 4": 0,
        "Week 5": 0,
    };

    appointments.forEach(apt => {
        const appointmentDate = parseISO(apt.date);
        if (appointmentDate >= start && appointmentDate <= end) {
            const weekOfMonth = getWeekOfMonth(appointmentDate, { weekStartsOn: 1 });
            const weekKey = `Week ${weekOfMonth}`;
            if (weeklyData[weekKey] !== undefined) {
                weeklyData[weekKey] += apt.price;
            }
        }
    });

    return Object.keys(weeklyData).map(week => ({
        name: week,
        revenue: weeklyData[week]
    }));
};

const groupDataByHour = (appointments: any[]) => {
    const hourlyData: { [key: number]: number } = {};
    for (let i = 0; i < 24; i++) { // From 0 AM to 11 PM
        hourlyData[i] = 0;
    }

    // appointments.forEach(apt => {
    //     try {
    //         // The time is in "h:mm a" format e.g. "9:00 AM"
    //         const appointmentTime = parse(apt.time, 'h:mm a', new Date());
    //         const hour = getHours(appointmentTime);
    //         if (hourlyData[hour] !== undefined) {
    //             hourlyData[hour] += apt.price;
    //         }
    //     } catch (error) {
    //         console.error("Error parsing time for revenue chart:", apt.time, error);
    //     }
    // });

    // return Object.keys(hourlyData).map(hourStr => {
    //     const hour = parseInt(hourStr);
    //     return {
    //         name: format(new Date(2000, 0, 1, hour), 'ha'), // 'ha' for '9am', '12pm' etc.
    //         revenue: hourlyData[hour]
    //     };
    // });
    appointments.forEach(apt => {
        try {
            const appointmentTime = parse(apt.time, 'h:mm a', new Date());
            const hour = getHours(appointmentTime);
            if (hour >= 0 && hour < 24) {
                hourlyData[hour] += apt.price;
            }
        } catch (error) {
            console.error("Error parsing time for revenue chart:", apt.time, error);
        }
    });

    return Object.keys(hourlyData).map(hourStr => {
        const hour = parseInt(hourStr, 10);
        // Format hour like "12AM", "1AM", ..., "11PM"
        const displayLabel = format(new Date(2000, 0, 1, hour), 'h:mm a'); // or 'ha' for "12am", "1am"
        // If you prefer "12AM" instead of "12:00 AM", use 'ha' and replace lowercase
        const cleanLabel = format(new Date(2000, 0, 1, hour), 'ha')
            .replace('am', 'AM')
            .replace('pm', 'PM');
        return {
            name: cleanLabel, // e.g., "12AM", "1AM", ..., "11PM"
            revenue: hourlyData[hour],
        };
    });
};


export function RevenueChart({ appointments, period }: { appointments: any[]; period: "today" | "week" | "month" }) {

    const chartData = useMemo(() => {
        if (period === 'today') {
            return groupDataByHour(appointments);
        }
        if (period === 'week') {
            return groupDataByDay(appointments);
        }
        if (period === 'month') {
            return groupDataByWeek(appointments);
        }
        return [];

    }, [appointments, period]);

    return (
        <ResponsiveContainer width="100%" height="100%" minHeight={250}>
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
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    //   tickFormatter={(value) => `PKR ${value}`}
                    tickFormatter={(value) => {
                        // Format large numbers: 1000 -> 1K, 1000000 -> 1M, etc.
                        if (value >= 1000000) {
                            return `PKR ${(value / 1000000)}M`;
                        } else if (value >= 1000) {
                            return `PKR ${(value / 1000)}K`;
                        } else {
                            return `PKR ${value}`;
                        }
                    }}
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
