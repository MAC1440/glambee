import { format, subDays, addDays } from 'date-fns';

export const branches = [
  {
    id: "salon_01",
    name: "Downtown Studio",
    address: "123 Main St, Anytown, USA",
  },
  {
    id: "salon_02",
    name: "Uptown Oasis",
    address: "456 Oak Ave, Anytown, USA",
  },
];

export const users = [
  {
    id: "user_01",
    name: "Super Admin",
    email: "super@admin.com",
    password: "password",
    avatar: "https://picsum.photos/seed/super-admin/100/100",
    role: "SUPER_ADMIN",
    salonId: null,
  },
  {
    id: "user_02",
    name: "Salon Admin",
    email: "salon@admin.com",
    password: "password",
    avatar: "https://picsum.photos/seed/salon-admin/100/100",
    role: "SALON_ADMIN",
    salonId: "salon_01",
  },
  {
    id: "user_03",
    name: "Uptown Admin",
    email: "uptown@admin.com",
    password: "password",
    avatar: "https://picsum.photos/seed/uptown-admin/100/100",
    role: "SALON_ADMIN",
    salonId: "salon_02",
  },
];

const today = new Date();
const yesterday = subDays(today, 1);
const tomorrow = addDays(today, 1);

export const attendanceRecords = [
  // Today's records
  { staffId: "staff_01", date: format(today, "yyyy-MM-dd"), clockIn: "09:55 AM", clockOut: "06:05 PM", status: "Present" },
  { staffId: "staff_02", date: format(today, "yyyy-MM-dd"), clockIn: "08:58 AM", clockOut: "05:02 PM", status: "Present" },
  { staffId: "staff_03", date: format(today, "yyyy-MM-dd"), clockIn: "10:50 AM", clockOut: "07:10 PM", status: "Present" },
  { staffId: "staff_04", date: format(today, "yyyy-MM-dd"), clockIn: "10:05 AM", clockOut: "06:15 PM", status: "Late" },
  { staffId: "staff_05", date: format(today, "yyyy-MM-dd"), clockIn: "09:00 AM", clockOut: "05:00 PM", status: "Present" },
  { staffId: "staff_06", date: format(today, "yyyy-MM-dd"), clockIn: null, clockOut: null, status: "Absent" },
  
  // Yesterday's records
  { staffId: "staff_01", date: format(yesterday, "yyyy-MM-dd"), clockIn: "10:00 AM", clockOut: "06:00 PM", status: "Present" },
  { staffId: "staff_02", date: format(yesterday, "yyyy-MM-dd"), clockIn: "09:02 AM", clockOut: "05:00 PM", status: "Present" },
  { staffId: "staff_03", date: format(yesterday, "yyyy-MM-dd"), clockIn: null, clockOut: null, status: "On Leave" },
  { staffId: "staff_04", date: format(yesterday, "yyyy-MM-dd"), clockIn: "10:15 AM", clockOut: "06:00 PM", status: "Late" },
  { staffId: "staff_05", date: format(yesterday, "yyyy-MM-dd"), clockIn: "09:05 AM", clockOut: "05:05 PM", status: "Present" },
  { staffId: "staff_06", date: format(yesterday, "yyyy-MM-dd"), clockIn: "10:00 AM", clockOut: "06:00 PM", status: "Present" },

  // Tomorrow's records (for leave)
  { staffId: "staff_02", date: format(tomorrow, "yyyy-MM-dd"), clockIn: null, clockOut: null, status: "On Leave" },
];


export const staff = [
  { id: "staff_01", name: "Jessica Miller", role: "Senior Stylist", department: "Stylist", salonId: "salon_01", skills: ["Coloring", "Balayage", "Updos"], commission: 15, shiftTimings: "10 AM - 6 PM", attendance: attendanceRecords.filter(a => a.staffId === 'staff_01') },
  { id: "staff_02", name: "Michael Chen", role: "Stylist", department: "Stylist", salonId: "salon_01", skills: ["Men's Cuts", "Fades", "Styling"], commission: 10, shiftTimings: "9 AM - 5 PM", attendance: attendanceRecords.filter(a => a.staffId === 'staff_02') },
  { id: "staff_03", name: "Emily Rodriguez", role: "Lead Nail Tech", department: "Nail Artist", salonId: "salon_02", skills: ["Gel-X", "Nail Art", "Acrylics"], commission: 12, shiftTimings: "11 AM - 7 PM", attendance: attendanceRecords.filter(a => a.staffId === 'staff_03') },
  { id: "staff_04", name: "David Wilson", role: "Nail Technician", department: "Nail Artist", salonId: "salon_02", skills: ["Manicures", "Pedicures"], commission: 10, shiftTimings: "10 AM - 6 PM", attendance: attendanceRecords.filter(a => a.staffId === 'staff_04') },
  { id: "staff_05", name: "Olivia Brown", role: "Front Desk Coordinator", department: "Receptionist", salonId: "salon_01", skills: ["Booking", "Client Relations"], commission: 0, shiftTimings: "9 AM - 5 PM", attendance: attendanceRecords.filter(a => a.staffId === 'staff_05') },
  { id: "staff_06", name: "Daniel Green", role: "Salon Assistant", department: "Assistant", salonId: "salon_02", skills: ["Shampooing", "Cleaning"], commission: 0, shiftTimings: "10 AM - 6 PM", attendance: attendanceRecords.filter(a => a.staffId === 'staff_06') },
];

export const serviceCategories = ["Hair", "Nails", "Makeup", "Skin", "Spa", "Aesthetics", "Others"];
export const staffRoles = ["Manager", "Senior Stylist", "Stylist", "Lead Nail Tech", "Nail Technician", "Esthetician", "Front Desk Coordinator", "Salon Assistant"];
export const staffSkills = ["Coloring", "Balayage", "Updos", "Men's Cuts", "Fades", "Styling", "Gel-X", "Nail Art", "Acrylics", "Manicures", "Pedicures", "Booking", "Client Relations", "Shampooing", "Cleaning"];

export const services = [
  // Promotions
  {
    id: "promo_01",
    name: "20% Off First Visit",
    description: "New clients get 20% off any single service on their first visit.",
    price: "Varies",
    originalPrice: null,
    duration: null,
    image: "https://picsum.photos/seed/promo-new/600/400",
    category: "Promotion",
    artists: staff.map(s => ({ value: s.id, label: s.name })), // All staff can apply this promo
  },
  {
    id: "promo_02",
    name: "Refer a Friend, Get $25 Off",
    description: "Refer a new client and you both get $25 off your next service.",
    price: "$25 Credit",
    originalPrice: null,
    duration: null,
    image: "https://picsum.photos/seed/promo-refer/600/400",
    category: "Promotion",
    artists: staff.map(s => ({ value: s.id, label: s.name })), // All staff can apply this promo
  },
  // Deals
  {
    id: "deal_01",
    name: "Mani-Pedi Combo",
    description: "Our Luxury Manicure and Spa Pedicure together at a special price.",
    price: 100.0,
    originalPrice: 110.0,
    duration: 105,
    image: "https://picsum.photos/seed/mani-pedi/600/400",
    category: "Deal",
    artists: staff.filter(s => s.department === 'Nail Artist').map(s => ({ value: s.id, label: s.name })), // Only nail artists
    includedServices: [
        { value: "svc_04", label: "Luxury Manicure" },
        { value: "svc_05", label: "Spa Pedicure" }
    ]
  },
  {
    id: "deal_02",
    name: "Cut, Color & Condition",
    description: "A complete hair refresh: Signature Haircut, Full Color, and a Deep Conditioning Treatment.",
    price: 275.0,
    originalPrice: 290.0,
    duration: 210,
    image: "https://picsum.photos/seed/hair-package/600/400",
    category: "Deal",
    artists: staff.filter(s => s.department === 'Stylist').map(s => ({ value: s.id, label: s.name })), // Only stylists
    includedServices: [
        { value: "svc_01", label: "Signature Haircut & Style" },
        { value: "svc_02", label: "Full Color & Gloss" },
        { value: "svc_06", label: "Deep Conditioning Treatment" }
    ]
  },
  // Individual Services
  {
    id: "svc_01",
    name: "Signature Haircut & Style",
    description: "A customized haircut designed by your stylist to fit your individual style and preferences, includes a relaxing shampoo and professional styling.",
    price: 85.0,
    originalPrice: null,
    duration: 60,
    image: "https://picsum.photos/seed/haircut/600/400",
    category: "Service",
    serviceCategory: "Hair",
    artists: staff.filter(s => s.department === 'Stylist').map(s => ({ value: s.id, label: s.name })),
    recipe: [],
  },
  {
    id: "svc_02",
    name: "Full Color & Gloss",
    description: "Permanent or semi-permanent color application from roots to ends, finished with a gloss for shine and vibrancy.",
    price: 150.0,
    originalPrice: null,
    duration: 120,
    image: "https://picsum.photos/seed/hair-color/600/400",
    category: "Service",
    serviceCategory: "Hair",
    artists: staff.filter(s => s.department === 'Stylist').map(s => ({ value: s.id, label: s.name })),
    recipe: [
        { itemId: 'inv_01', quantity: 1 },
        { itemId: 'inv_02', quantity: 0.5 },
    ]
  },
  {
    id: "svc_03",
    name: "Balayage / Ombré",
    description: "A technique for highlighting hair in which the dye is painted on in such a way as to create a graduated, natural-looking effect.",
    price: 250.0,
    originalPrice: null,
    duration: 180,
    image: "https://picsum.photos/seed/balayage/600/400",
    category: "Service",
    serviceCategory: "Hair",
    artists: staff.filter(s => s.department === 'Stylist').map(s => ({ value: s.id, label: s.name })),
    recipe: [],
  },
  {
    id: "svc_04",
    name: "Luxury Manicure",
    description: "Includes nail shaping, cuticle care, a relaxing hand massage, and a polish of your choice. A true treat for your hands.",
    price: 45.0,
    originalPrice: null,
    duration: 45,
    image: "https://picsum.photos/seed/manicure/600/400",
    category: "Service",
    serviceCategory: "Nails",
    artists: staff.filter(s => s.department === 'Nail Artist').map(s => ({ value: s.id, label: s.name })),
    recipe: [],
  },
  {
    id: "svc_05",
    name: "Spa Pedicure",
    description: "Relax in our massage chairs while we pamper your feet. Includes a warm soak, exfoliation, nail care, massage, and polish.",
    price: 65.0,
    originalPrice: null,
    duration: 60,
    image: "https://picsum.photos/seed/pedicure/600/400",
    category: "Service",
    serviceCategory: "Nails",
    artists: staff.filter(s => s.department === 'Nail Artist').map(s => ({ value: s.id, label: s.name })),
    recipe: [],
  },
  {
    id: "svc_06",
    name: "Deep Conditioning Treatment",
    description: "An intense conditioning treatment to restore moisture, protein, and shine to dry, damaged hair. Add-on to any hair service.",
    price: 55.0,
    originalPrice: null,
    duration: 30,
    image: "https://picsum.photos/seed/hair-mask/600/400",
    category: "Service",
    serviceCategory: "Hair",
    artists: staff.filter(s => s.department === 'Stylist' || s.department === 'Assistant').map(s => ({ value: s.id, label: s.name })),
    recipe: [],
  },
  {
    id: "svc_07",
    name: "Event Makeup Application",
    description: "Professional makeup application for special events like weddings or proms. Includes optional false lash application.",
    price: 120.0,
    originalPrice: null,
    duration: 75,
    image: "https://picsum.photos/seed/makeup-event/600/400",
    category: "Service",
    serviceCategory: "Makeup",
    artists: staff.filter(s => s.department === 'Stylist').map(s => ({ value: s.id, label: s.name })),
    recipe: [],
  },
  {
    id: "svc_08",
    name: "Classic Facial",
    description: "A customized facial to address your skin's needs, including cleansing, exfoliation, extractions, and a hydrating mask.",
    price: 130.0,
    originalPrice: null,
    duration: 60,
    image: "https://picsum.photos/seed/facial/600/400",
    category: "Service",
    serviceCategory: "Skin",
    artists: [], // Assume an esthetician would do this. None in staff list yet.
    recipe: [],
  },
  {
    id: "svc_09",
    name: "Swedish Massage",
    description: "A relaxing full-body massage using long, flowing strokes to reduce tension and improve circulation.",
    price: 110.0,
    originalPrice: null,
    duration: 60,
    image: "https://picsum.photos/seed/massage/600/400",
    category: "Service",
    serviceCategory: "Spa",
    artists: [], // Assume a massage therapist would do this.
    recipe: [],
  },
  {
    id: "svc_10",
    name: "Chemical Peel",
    description: "A chemical solution is applied to the skin to remove the top layers, revealing smoother, more youthful skin underneath.",
    price: 180.0,
    originalPrice: null,
    duration: 45,
    image: "https://picsum.photos/seed/peel/600/400",
    category: "Service",
    serviceCategory: "Aesthetics",
    artists: [], // Specialized service
    recipe: [],
  },
  {
    id: "svc_11",
    name: "Bridal Consultation",
    description: "A one-on-one consultation to plan your hair and makeup for your special day. Cost is credited towards your wedding day services.",
    price: 100.0,
    originalPrice: null,
    duration: 60,
    image: "https://picsum.photos/seed/bridal/600/400",
    category: "Service",
    serviceCategory: "Others",
    artists: staff.filter(s => s.department === 'Stylist').map(s => ({ value: s.id, label: s.name })),
    recipe: [],
  },
];


export const departments = [
  "Stylist",
  "Nail Artist",
  "Esthetician",
  "Massage Therapist",
  "Receptionist",
  "Assistant",
  "Manager",
];

export const mockCustomers = [
  {
    id: "cust_01",
    phone: "+923001234567",
    name: "Sophia Davis",
    email: "sophia@example.com",
    salonId: "salon_01",
    gender: "Female",
    dob: "1990-05-15",
  },
  {
    id: "cust_02",
    phone: "+923217654321",
    name: "Liam Garcia",
    email: "liam@example.com",
    salonId: "salon_01",
    gender: "Male",
    dob: "1988-11-22",
  },
  {
    id: "cust_03",
    phone: "+14155551234",
    name: "Ava Johnson",
    email: "ava@example.com",
    salonId: "salon_02",
    gender: "Female",
    dob: "1995-02-10",
  },
  {
    id: "cust_04",
    phone: "+14155555678",
    name: "Noah Brown",
    email: "noah@example.com",
    salonId: "salon_02",
    gender: "Male",
    dob: "2001-09-01",
  },
  {
    id: "cust_05",
    phone: "+14155558765",
    name: "Isabella Smith",
    email: "isabella@example.com",
    salonId: "salon_01",
    gender: "Female",
    dob: "1998-07-19",
  },
  {
    id: "cust_06",
    phone: "+14155554321",
    name: "James Williams",
    email: "james@example.com",
    salonId: "salon_02",
    gender: "Male",
    dob: "1985-03-25",
  },
  {
    id: "cust_07",
    phone: "+16505551111",
    name: "Olivia Jones",
    email: "olivia.jones@example.com",
    salonId: "salon_01",
    gender: "Female",
    dob: "1992-12-30",
  },
  {
    id: "cust_08",
    phone: "+16505552222",
    name: "Benjamin Garcia",
    email: "benjamin.garcia@example.com",
    salonId: "salon_02",
    gender: "Male",
    dob: "1993-08-14",
  },
  {
    id: "cust_09",
    phone: "+16505553333",
    name: "Mia Martinez",
    email: "mia.martinez@example.com",
    salonId: "salon_01",
    gender: "Female",
    dob: "2000-01-20",
  },
  {
    id: "cust_10",
    phone: "+16505554444",
    name: "Ethan Rodriguez",
    email: "ethan.rodriguez@example.com",
    salonId: "salon_02",
    gender: "Male",
    dob: "1999-06-05",
  },
  {
    id: "cust_11",
    phone: "+16505555555",
    name: "Abigail Taylor",
    email: "abigail.taylor@example.com",
    salonId: "salon_01",
    gender: "Female",
    dob: "1997-04-12",
  },
  {
    id: "cust_12",
    phone: "+16505556666",
    name: "William Anderson",
    email: "william.anderson@example.com",
    salonId: "salon_02",
    gender: "Male",
    dob: "1980-10-18",
  },
  {
    id: "cust_13",
    phone: "+16505557777",
    name: "Charlotte Thomas",
    email: "charlotte.thomas@example.com",
    salonId: "salon_01",
    gender: "Female",
    dob: "1994-05-28",
  },
  {
    id: "cust_14",
    phone: "+16505558888",
    name: "Daniel White",
    email: "daniel.white@example.com",
    salonId: "salon_02",
    gender: "Male",
    dob: "1991-02-17",
  },
  {
    id: "cust_15",
    phone: "+16505559999",
    name: "Harper Harris",
    email: "harper.harris@example.com",
    salonId: "salon_01",
    gender: "Female",
    dob: "2002-08-21",
  },
];

export const appointments = [
  {
    id: "apt_01",
    salonId: "salon_01",
    customer: mockCustomers[0], // Sophia Davis
    service: "Balayage / Ombré",
    staff: "Jessica Miller",
    date: "2024-07-30",
    time: "09:00 AM",
    price: 250.0,
    rating: 5,
    review: "Jessica is a true artist! My balayage has never looked better. She really took the time to understand what I wanted.",
  },
  {
    id: "apt_02",
    salonId: "salon_01",
    customer: mockCustomers[1], // Liam Garcia
    service: "Signature Haircut & Style",
    staff: "Michael Chen",
    date: "2024-07-30",
    time: "10:00 AM",
    price: 85.0,
    rating: 5,
    review: "Michael gave me the best haircut I've had in years. He's professional, skilled, and gives great advice. Highly recommend.",
  },
  {
    id: "apt_03",
    salonId: "salon_02",
    customer: mockCustomers[2], // Ava Johnson
    service: "Luxury Manicure",
    staff: "Emily Rodriguez",
    date: "2024-07-30",
    time: "11:00 AM",
    price: 45.0,
    rating: 4,
    review: "Very relaxing and my nails look great. The hand massage was a highlight. A bit of a wait before my appointment, though.",
  },
  {
    id: "apt_04",
    salonId: "salon_01",
    customer: mockCustomers[3], // Noah Brown
    service: "Full Color & Gloss",
    staff: "Jessica Miller",
    date: "2024-07-30",
    time: "12:00 PM",
    price: 150.0,
    rating: 5,
    review: "Perfect color, exactly what I asked for. Jessica is amazing with color.",
  },
  {
    id: "apt_05",
    salonId: "salon_02",
    customer: mockCustomers[4], // Isabella Smith
    service: "Spa Pedicure",
    staff: "David Wilson",
    date: "2024-07-30",
    time: "01:00 PM",
    price: 65.0,
    rating: 4,
    review: "Good service and my feet feel refreshed, but the salon was a bit noisy and it was hard to relax.",
  },
  {
    id: "apt_06",
    salonId: "salon_01",
    customer: mockCustomers[0], // Sophia Davis
    service: "Signature Haircut & Style",
    staff: "Michael Chen",
    date: "2024-08-01",
    time: "02:00 PM",
    price: 85.0,
    rating: 5,
    review: "Another fantastic cut from Michael. He's so consistent and always does a wonderful job.",
  },
  {
    id: "apt_07",
    salonId: "salon_02",
    customer: mockCustomers[6], // Olivia Jones
    service: "Deep Conditioning Treatment",
    staff: "Emily Rodriguez",
    date: "2024-08-02",
    time: "09:00 AM",
    price: 55.0,
    rating: 5,
    review: "My hair feels so soft and healthy. Emily was very gentle and explained the benefits of the treatment. Thank you!",
  },
  {
    id: "apt_08",
    salonId: "salon_01",
    customer: mockCustomers[7], // Benjamin Garcia
    service: "Balayage / Ombré",
    staff: "Jessica Miller",
    date: "2024-08-05",
    time: "10:00 AM",
    price: 250.0,
    rating: 4,
    review: "The color is beautiful, but it took much longer than I expected. Be prepared to spend a few hours here.",
  },
  {
    id: "apt_09",
    salonId: "salon_02",
    customer: mockCustomers[8], // Mia Martinez
    service: "Luxury Manicure",
    staff: "David Wilson",
    date: "2024-08-10",
    time: "11:00 AM",
    price: 45.0,
    rating: 5,
    review: "David is meticulous and so friendly. My manicure looks perfect and lasted for two weeks without chipping.",
  },
  {
    id: "apt_10",
    salonId: "salon_01",
    customer: mockCustomers[1], // Liam Garcia
    service: "Signature Haircut & Style",
    staff: "Michael Chen",
    date: "2024-08-15",
    time: "01:00 PM",
    price: 85.0,
    rating: 5,
    review: "Consistent and high-quality service every time. Michael is a true professional.",
  },
  {
    id: "apt_11",
    salonId: "salon_02",
    customer: mockCustomers[10], // Abigail Taylor
    service: "Spa Pedicure",
    staff: "David Wilson",
    date: "2024-07-30",
    time: "02:00 PM",
    price: 65.0,
    rating: 3,
    review: "It was okay, but I've had better pedicures elsewhere. The massage was very short and the polish was a bit messy.",
  },
  {
    id: "apt_12",
    salonId: "salon_01",
    customer: mockCustomers[0], // Sophia Davis
    service: "Full Color & Gloss",
    staff: "Jessica Miller",
    date: "2024-07-20",
    time: "03:00 PM",
    price: 150.0,
    rating: 5,
    review: "Love the color! Jessica always gets it right.",
  },
  {
    id: "apt_13",
    salonId: "salon_01",
    customer: mockCustomers[12], // Charlotte Thomas
    service: "Signature Haircut & Style",
    staff: "Michael Chen",
    date: "2024-07-30",
    time: "04:00 PM",
    price: 85.0,
    rating: 4,
    review: "Good haircut, but I had to wait 20 minutes past my appointment time.",
  },
  {
    id: "apt_14",
    salonId: "salon_02",
    customer: mockCustomers[13], // Daniel White
    service: "Balayage / Ombré",
    staff: "Emily Rodriguez",
    date: "2024-08-01",
    time: "09:00 AM",
    price: 250.0,
    rating: 5,
    review: "Emily is a magician with color. Worth every penny. The result is so natural and beautiful.",
  },
  {
    id: "apt_15",
    salonId: "salon_02",
    customer: mockCustomers[14], // Harper Harris
    service: "Luxury Manicure",
    staff: "David Wilson",
    date: "2024-8-01",
    time: "10:00 AM",
    price: 45.0,
    rating: 5,
    review: "A wonderful experience! David was lovely and my nails are perfect.",
  },
];

export const salarySlips = [
  { slipId: "slip_01", staffId: "staff_01", month: 7, year: 2024, baseSalary: 3000, commission: 450.50, deductions: 250, totalEarnings: 3200.50 },
  { slipId: "slip_02", staffId: "staff_01", month: 6, year: 2024, baseSalary: 3000, commission: 420.00, deductions: 250, totalEarnings: 3170.00 },
  { slipId: "slip_03", staffId: "staff_02", month: 7, year: 2024, baseSalary: 2500, commission: 255.00, deductions: 200, totalEarnings: 2555.00 },
  { slipId: "slip_04", staffId: "staff_03", month: 7, year: 2024, baseSalary: 2800, commission: 310.20, deductions: 220, totalEarnings: 2890.20 },
  { slipId: "slip_05", staffId: "staff_04", month: 7, year: 2024, baseSalary: 2200, commission: 180.00, deductions: 180, totalEarnings: 2200.00 },
  { slipId: "slip_06", staffId: "staff_05", month: 7, year: 2024, baseSalary: 2000, commission: 0, deductions: 150, totalEarnings: 1850.00 },
  { slipId: "slip_07", staffId: "staff_06", month: 7, year: 2024, baseSalary: 1800, commission: 0, deductions: 120, totalEarnings: 1680.00 },
];

export const inventoryCategories = ["Hair Color", "Shampoo & Conditioner", "Styling Products", "Nail Polish", "Skincare", "Disposables"];
export const suppliers = [
    { id: 'sup_01', name: 'Pro Beauty Supply' },
    { id: 'sup_02', name: 'Salon Essentials Inc.' },
    { id: 'sup_03', name: 'Nail Fashions' },
];

export const inventoryItems = [
    { id: 'inv_01', name: 'L\'Oréal Majirel 6.0', sku: 'LO-MAJ-60', category: 'Hair Color', supplier: 'Pro Beauty Supply', quantity: 15, lowStockThreshold: 5, expiryDate: '2025-12-31' },
    { id: 'inv_02', name: 'Wella Blondor Multi-Blonde Powder', sku: 'WE-BLO-P', category: 'Hair Color', supplier: 'Pro Beauty Supply', quantity: 8, lowStockThreshold: 3, expiryDate: '2025-08-31' },
    { id: 'inv_03', name: 'Kerastase Resistance Bain Force Architecte Shampoo', sku: 'KE-RES-SH', category: 'Shampoo & Conditioner', supplier: 'Salon Essentials Inc.', quantity: 2, lowStockThreshold: 5, expiryDate: '2026-01-31' },
    { id: 'inv_04', name: 'OPI Nail Lacquer - Bubble Bath', sku: 'OPI-NL-BUB', category: 'Nail Polish', supplier: 'Nail Fashions', quantity: 25, lowStockThreshold: 10, expiryDate: '2024-09-30' },
    { id: 'inv_05', name: 'CND Shellac Top Coat', sku: 'CND-SH-TOP', category: 'Nail Polish', supplier: 'Nail Fashions', quantity: 12, lowStockThreshold: 5, expiryDate: '2025-06-30' },
    { id: 'inv_06', name: 'Disposable Towels (Pack of 100)', sku: 'DIS-TOW-100', category: 'Disposables', supplier: 'Salon Essentials Inc.', quantity: 50, lowStockThreshold: 20, expiryDate: null },
    { id: 'inv_07', name: 'Dermalogica Special Cleansing Gel', sku: 'DER-SCG-250', category: 'Skincare', supplier: 'Salon Essentials Inc.', quantity: 0, lowStockThreshold: 4, expiryDate: '2025-10-31' },
    { id: 'inv_08', name: 'Expired Hair Gel', sku: 'OLD-GEL-01', category: 'Styling Products', supplier: 'Pro Beauty Supply', quantity: 10, lowStockThreshold: 5, expiryDate: '2024-01-01' },
];
