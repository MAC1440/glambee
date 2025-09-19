
export type AuditLogEntry = {
  id: string;
  itemId: string;
  itemName: string;
  timestamp: string;
  action: "Created" | "Received" | "Dispatched" | "Sold" | "Wasted" | "Updated";
  quantity: number;
  user: string;
  notes?: string;
};

export let inventoryAuditLog: AuditLogEntry[] = [
  {
    id: "log_01",
    itemId: "inv_01",
    itemName: "L'Oréal Majirel 6.0",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    action: "Received",
    quantity: 20,
    user: "Super Admin",
    notes: "GRN-001 from Pro Beauty Supply",
  },
  {
    id: "log_02",
    itemId: "inv_03",
    itemName: "Kerastase Resistance Bain Force Architecte Shampoo",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    action: "Received",
    quantity: 10,
    user: "Super Admin",
    notes: "GRN-002 from Salon Essentials Inc.",
  },
  {
    id: "log_03",
    itemId: "inv_01",
    itemName: "L'Oréal Majirel 6.0",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    action: "Dispatched",
    quantity: 2,
    user: "Super Admin",
    notes: "Issued to Jessica Miller for station top-up.",
  },
  {
    id: "log_04",
    itemId: "inv_08",
    itemName: "Expired Hair Gel",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    action: "Wasted",
    quantity: 10,
    user: "Super Admin",
    notes: "Product expired.",
  },
];

export const addAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: AuditLogEntry = {
        ...entry,
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
    };
    inventoryAuditLog.unshift(newEntry);
};
