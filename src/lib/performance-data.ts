
import { staff, appointments, attendanceRecords } from "./placeholder-data";

export const performanceData = staff.map((s) => {
  const staffAppointments = appointments.filter((apt) => apt.staff === s.name);
  const staffAttendance = attendanceRecords.filter(
    (rec) => rec.staffId === s.id
  );

  const totalSales = staffAppointments.reduce((sum, apt) => sum + apt.price, 0);
  const servicesCompleted = staffAppointments.length;

  const presentDays = staffAttendance.filter(
    (rec) => rec.status === "Present" || rec.status === "Late"
  ).length;
  const totalDaysTracked = staffAttendance.length;
  const attendanceRate =
    totalDaysTracked > 0 ? (presentDays / totalDaysTracked) * 100 : 0;

  // Mocking average rating
  const avgRating = 4 + Math.random(); // Random rating between 4.0 and 5.0

  return {
    staffId: s.id,
    name: s.name,
    totalSales,
    servicesCompleted,
    attendanceRate: parseFloat(attendanceRate.toFixed(1)),
    avgRating: parseFloat(avgRating.toFixed(1)),
  };
});
