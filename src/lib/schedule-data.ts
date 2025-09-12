
export type ScheduleAppointment = {
  id: string;
  customerName: string;
  customerAvatar: string;
  service: string;
  start: Date;
  end: Date;
  staffId: string;
};

const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);
const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);


const setTimeToDate = (date: Date, hour: number, minute: number) => {
    const newDate = new Date(date);
    newDate.setHours(hour, minute, 0, 0);
    return newDate;
}

export const scheduleAppointments: ScheduleAppointment[] = [
  {
    id: "sch_apt_01",
    customerName: "Sophia Davis",
    customerAvatar: "https://picsum.photos/seed/Sophia Davis/100",
    service: "Balayage / Ombré",
    start: setTimeToDate(today, 9, 0),
    end: setTimeToDate(today, 10, 30),
    staffId: "staff_01",
  },
  {
    id: "sch_apt_02",
    customerName: "Liam Garcia",
    customerAvatar: "https://picsum.photos/seed/Liam Garcia/100",
    service: "Signature Haircut & Style",
    start: setTimeToDate(today, 11, 0),
    end: setTimeToDate(today, 12, 0),
    staffId: "staff_02",
  },
  {
    id: "sch_apt_03",
    customerName: "Ava Johnson",
    customerAvatar: "https://picsum.photos/seed/Ava Johnson/100",
    service: "Luxury Manicure",
    start: setTimeToDate(today, 14, 0),
    end: setTimeToDate(today, 15, 0),
    staffId: "staff_03",
  },
  {
    id: "sch_apt_04",
    customerName: "Noah Brown",
    customerAvatar: "https://picsum.photos/seed/Noah Brown/100",
    service: "Full Color & Gloss",
    start: setTimeToDate(yesterday, 10, 0),
    end: setTimeToDate(yesterday, 12, 0),
    staffId: "staff_01",
  },
  {
    id: "sch_apt_05",
    customerName: "Isabella Smith",
    customerAvatar: "https://picsum.photos/seed/Isabella Smith/100",
    service: "Spa Pedicure",
    start: setTimeToDate(tomorrow, 13, 0),
    end: setTimeToDate(tomorrow, 14, 0),
    staffId: "staff_04",
  },
   {
    id: "sch_apt_06",
    customerName: "James Williams",
    customerAvatar: "https://picsum.photos/seed/James Williams/100",
    service: "Signature Haircut & Style",
    start: setTimeToDate(tomorrow, 15, 0),
    end: setTimeToDate(tomorrow, 16, 0),
    staffId: "staff_02",
  },
    {
    id: "sch_apt_07",
    customerName: "Olivia Brown",
    customerAvatar: "https://picsum.photos/seed/Olivia Brown/100",
    service: "Deep Conditioning Treatment",
    start: setTimeToDate(today, 12, 0),
    end: setTimeToDate(today, 12, 30),
    staffId: "staff_02",
  },
];
