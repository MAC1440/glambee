export const user = {
  name: "Olivia Martin",
  email: "olivia.martin@email.com",
  avatar: "https://picsum.photos/seed/olivia/100",
};

export const services = [
  {
    id: "svc_01",
    name: "Signature Haircut & Style",
    description:
      "A customized haircut designed by your stylist to fit your individual style and preferences, includes a relaxing shampoo and professional styling.",
    price: 85.0,
    duration: 60,
    image: "https://picsum.photos/seed/haircut/600/400",
  },
  {
    id: "svc_02",
    name: "Full Color & Gloss",
    description:
      "Permanent or semi-permanent color application from roots to ends, finished with a gloss for shine and vibrancy.",
    price: 150.0,
    duration: 120,
    image: "https://picsum.photos/seed/hair-color/600/400",
  },
  {
    id: "svc_03",
    name: "Balayage / Ombré",
    description:
      "A technique for highlighting hair in which the dye is painted on in such a way as to create a graduated, natural-looking effect.",
    price: 250.0,
    duration: 180,
    image: "https://picsum.photos/seed/balayage/600/400",
  },
  {
    id: "svc_04",
    name: "Luxury Manicure",
    description:
      "Includes nail shaping, cuticle care, a relaxing hand massage, and a polish of your choice. A true treat for your hands.",
    price: 45.0,
    duration: 45,
    image: "https://picsum.photos/seed/manicure/600/400",
  },
  {
    id: "svc_05",
    name: "Spa Pedicure",
    description:
      "Relax in our massage chairs while we pamper your feet. Includes a warm soak, exfoliation, nail care, massage, and polish.",
    price: 65.0,
    duration: 60,
    image: "https://picsum.photos/seed/pedicure/600/400",
  },
  {
    id: "svc_06",
    name: "Deep Conditioning Treatment",
    description:
      "An intense conditioning treatment to restore moisture, protein, and shine to dry, damaged hair. Add-on to any hair service.",
    price: 55.0,
    duration: 30,
    image: "https://picsum.photos/seed/hair-mask/600/400",
  },
];

export const staff = [
  { id: "staff_01", name: "Jessica Miller" },
  { id: "staff_02", name: "Michael Chen" },
  { id: "staff_03", name: "Emily Rodriguez" },
  { id: "staff_04", name: "David Wilson" },
];

export const appointments = [
  {
    id: "apt_01",
    customer: { name: "Sophia Davis", email: "sophia@example.com" },
    service: "Balayage / Ombré",
    staff: "Jessica Miller",
    date: "2024-07-30",
    time: "09:00 AM",
    price: 250.0,
  },
  {
    id: "apt_02",
    customer: { name: "Liam Garcia", email: "liam@example.com" },
    service: "Signature Haircut & Style",
    staff: "Michael Chen",
    date: "2024-07-30",
    time: "10:00 AM",
    price: 85.0,
  },
  {
    id: "apt_03",
    customer: { name: "Ava Johnson", email: "ava@example.com" },
    service: "Luxury Manicure",
    staff: "Emily Rodriguez",
    date: "2024-07-30",
    time: "11:00 AM",
    price: 45.0,
  },
  {
    id: "apt_04",
    customer: { name: "Noah Brown", email: "noah@example.com" },
    service: "Full Color & Gloss",
    staff: "Jessica Miller",
    date: "2024-07-30",
    time: "12:00 PM",
    price: 150.0,
  },
  {
    id: "apt_05",
    customer: { name: "Isabella Smith", email: "isabella@example.com" },
    service: "Spa Pedicure",
    staff: "David Wilson",
    date: "2024-07-30",
    time: "01:00 PM",
    price: 65.0,
  },
  {
    id: "apt_06",
    customer: { name: "James Williams", email: "james@example.com" },
    service: "Signature Haircut & Style",
    staff: "Michael Chen",
    date: "2024-08-01",
    time: "02:00 PM",
    price: 85.0,
  },
  {
    id: "apt_07",
    customer: { name: "Olivia Jones", email: "olivia.jones@example.com" },
    service: "Deep Conditioning Treatment",
    staff: "Emily Rodriguez",
    date: "2024-08-02",
    time: "09:00 AM",
    price: 55.0,
  },
  {
    id: "apt_08",
    customer: { name: "Benjamin Garcia", email: "benjamin.garcia@example.com" },
    service: "Balayage / Ombré",
    staff: "Jessica Miller",
    date: "2024-08-05",
    time: "10:00 AM",
    price: 250.0,
  },
  {
    id: "apt_09",
    customer: { name: "Mia Martinez", email: "mia.martinez@example.com" },
    service: "Luxury Manicure",
    staff: "David Wilson",
    date: "2024-08-10",
    time: "11:00 AM",
    price: 45.0,
  },
    {
    id: "apt_10",
    customer: { name: "Ethan Rodriguez", email: "ethan.rodriguez@example.com" },
    service: "Signature Haircut & Style",
    staff: "Michael Chen",
    date: "2024-08-15",
    time: "01:00 PM",
    price: 85.0,
  },
  {
    id: "apt_11",
    customer: { name: "Abigail Taylor", email: "abigail.taylor@example.com" },
    service: "Spa Pedicure",
    staff: "David Wilson",
    date: "2024-07-30",
    time: "02:00 PM",
    price: 65.0,
  },
  {
    id: "apt_12",
    customer: { name: "William Anderson", email: "william.anderson@example.com" },
    service: "Full Color & Gloss",
    staff: "Jessica Miller",
    date: "2024-07-30",
    time: "03:00 PM",
    price: 150.0,
  },
  {
    id: "apt_13",
    customer: { name: "Charlotte Thomas", email: "charlotte.thomas@example.com" },
    service: "Signature Haircut & Style",
    staff: "Michael Chen",
    date: "2024-07-30",
    time: "04:00 PM",
    price: 85.0,
  },
  {
    id: "apt_14",
    customer: { name: "Daniel White", email: "daniel.white@example.com" },
    service: "Balayage / Ombré",
    staff: "Jessica Miller",
    date: "2024-08-01",
    time: "09:00 AM",
    price: 250.0,
  },
  {
    id: "apt_15",
    customer: { name: "Harper Harris", email: "harper.harris@example.com" },
    service: "Luxury Manicure",
    staff: "Emily Rodriguez",
    date: "2024-08-01",
    time: "10:00 AM",
    price: 45.0,
  },
];

export const trends = [
  {
    id: "trend_01",
    name: "Glass Hair",
    description:
      "A super-sleek, glossy finish that makes your hair look like a sheet of glass. Achieved with smoothing treatments and shine sprays.",
    image: "https://picsum.photos/seed/glass-hair/600/400",
  },
  {
    id: "trend_02",
    name: "Curtain Bangs",
    description:
      "A soft, face-framing fringe that grows out gracefully. This '70s-inspired look is versatile and suits most face shapes.",
    image: "https://picsum.photos/seed/curtain-bangs/600/400",
  },
  {
    id: "trend_03",
    name: "Jelly Nails",
    description:
      "A translucent, colorful manicure that resembles a jelly bean. It's a fun and playful look for any season.",
    image: "https://picsum.photos/seed/jelly-nails/600/400",
  },
  {
    id: "trend_04",
    name: "Wolf Cut",
    description:
      "A shaggy, layered hairstyle that combines the volume of a shag with the texture of a mullet. It's edgy and effortlessly cool.",
    image: "https://picsum.photos/seed/wolf-cut/600/400",
  },
];
