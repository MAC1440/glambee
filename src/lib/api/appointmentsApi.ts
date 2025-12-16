import { supabase } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/supabase";

type Appointment = Database['public']['Tables']['appointments']['Row'];
type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];
type AppointmentUpdate = Database['public']['Tables']['appointments']['Update'];

export interface AppointmentWithDetails extends Appointment {
    // Additional computed fields
    customer?: {
        id: string;
        name: string;
        email: string | null;
        phone_number: string | null;
        avatar: string | null;
    };
    staff?: {
        id: string | null;
        name: string | null;
        avatar: string | null;
    };
    services?: Array<{
        id: string;
        name: string;
        price: number;
    }>;
    deals?: Array<{
        id: string;
        name: string;
        price: number;
    }>;
}

export interface AppointmentFilters {
    customerId?: string;
    staffId?: string;
    salonId?: string;
    status?: 'upcoming' | 'past' | 'cancelled' | 'ongoing' | 'rejected' | 'accepted';
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    count: number;
    hasMore: boolean;
}

export interface CreateAppointmentData {
    customerId: string;
    staffId: string | null;
    services: Array<{
        serviceId: string;
        price: number;
        category: string;
    }>;
    startTime: string;
    endTime: string;
    date: string;
    notes?: string;
    bookingType?: string | undefined;
    bookingApproach?: string | undefined;
    salon_id?: string;
}

export class AppointmentsApi {
    /**
     * Get all appointments with optional filtering and pagination
     */
    static async getAppointments(filters: AppointmentFilters = {}): Promise<PaginatedResponse<AppointmentWithDetails>> {
        try {
            const limit = filters.limit;
            const offset = filters.offset || 0;

            // TODO: For now adjust price logic for appointments_deals from salons_deals table by matching deal_id
            let query = supabase
                .from('appointments')
                .select(`
                    *,
                    customer:customers!appointments_customer_id_fk(
                        id,
                        name,
                        auth_id
                    ),
                    staff:salons_staff!fk_staff_id(
                        id,
                        name,
                        avatar
                    ),
                    services:appointments_services(
                        id,
                        price,
                        service:salons_services(
                            id,
                            name
                        )
                    ),
                    deals:appointments_deals(
                        id,
                        deal:salons_deals(
                            id,
                            title,
                            discounted_price,
                            price
                        )
                    )
                `, { count: 'exact' });

            // Apply filters
            if (filters.salonId) {
                query = query.eq('salon_id', filters.salonId);
            }
            if (filters.customerId) {
                query = query.eq('customer_id', filters.customerId);
            }
            if (filters.staffId) {
                query = query.eq('staff_id', filters.staffId);
            }
            if (filters.status) {
                query = query.eq('status', filters.status);
            }
            if (filters.dateFrom) {
                query = query.gte('date', filters.dateFrom);
            }
            if (filters.dateTo) {
                query = query.lte('date', filters.dateTo);
            }

            // Apply ordering
            query = query.order('date', { ascending: false }).order('start_time', { ascending: false });

            // Apply range only if limit is specified
            if (limit !== undefined && limit > 0) {
                query = query.range(offset, offset + limit - 1);
            }

            const { data: appointments, error, count } = await query;

            if (error) {
                console.error('Error fetching appointments:', error);
                throw error;
            }

            // Transform data to include customer details from users table
            const appointmentsWithDetails: AppointmentWithDetails[] = [];

            // Batch fetch user details
            const authIds = appointments
                ?.map(apt => apt.customer?.auth_id)
                .filter((id): id is string => !!id) || [];

            const uniqueAuthIds = [...new Set(authIds)];
            const userMap = new Map();

            if (uniqueAuthIds.length > 0) {
                const { data: users, error: usersError } = await supabase
                    .from('users')
                    .select('id, email, phone_number, fullname, avatar')
                    .in('id', uniqueAuthIds);

                if (!usersError && users) {
                    users.forEach(user => userMap.set(user.id, user));
                }
            }

            for (const appointment of appointments || []) {
                let customerDetails = null;

                // lookup customer details from the map
                if (appointment.customer?.auth_id) {
                    const userData = userMap.get(appointment.customer.auth_id);

                    if (userData) {
                        customerDetails = {
                            id: appointment.customer.id,
                            name: userData.fullname || appointment.customer.name || 'Unknown',
                            email: userData.email,
                            phone_number: userData.phone_number,
                            avatar: userData.avatar
                        };
                    }
                }

                appointmentsWithDetails.push({
                    ...appointment,
                    customer: customerDetails || {
                        id: appointment.customer?.id || '',
                        name: appointment.customer?.name || 'Unknown',
                        email: null,
                        phone_number: null,
                        avatar: null
                    },
                    staff: appointment.staff || {
                        id: appointment.staff_id || '',
                        name: 'Unknown Staff',
                        avatar: null
                    },
                    services: appointment.services?.map(s => ({
                        id: s.service?.id || '',
                        name: s.service?.name || 'Unknown Service',
                        price: s.price
                    })) || [],
                    deals: appointment.deals?.map(d => ({
                        id: d.deal?.id || '',
                        name: d.deal?.title || 'Unknown Deal',
                        price: d.deal?.discounted_price || d.deal?.price || 0
                    })) || []
                });
            }

            return {
                data: appointmentsWithDetails,
                count: count || 0,
                hasMore: limit !== undefined ? (offset + limit) < (count || 0) : false
            };
        } catch (error) {
            console.error('Failed to fetch appointments:', error);
            throw error;
        }
    }

    /**
     * Get appointments for a specific customer
     */
    static async getAppointmentsByCustomerId(customerId: string, salonId: string): Promise<AppointmentWithDetails[]> {
        try {
            const response = await this.getAppointments({ customerId, salonId: salonId });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch customer appointments:', error);
            throw error;
        }
    }

    /**
     * Update appointment staff assignment
     */
    static async updateAppointmentStaff(appointmentId: string, staffId: string | null): Promise<AppointmentWithDetails> {
        try {
            const { data: appointment, error } = await supabase
                .from('appointments')
                .update({
                    staff_id: staffId,
                    updated_at: new Date().toISOString()
                })
                .eq('id', appointmentId)
                .select(`
                    *,
                    customer:customers(
                        id,
                        name,
                        auth_id
                    ),
                    staff:salons_staff(
                        id,
                        name,
                        avatar
                    )
                `)
                .single();

            if (error) {
                console.error('Error updating appointment staff:', error);
                throw error;
            }

            // Transform the data to match AppointmentWithDetails interface
            const transformedAppointment: AppointmentWithDetails = {
                ...appointment,
                customer: appointment.customer ? {
                    id: appointment.customer.id,
                    name: appointment.customer.name || '',
                    email: null,
                    phone_number: null,
                    avatar: null
                } : undefined,
                staff: appointment.staff ? {
                    id: appointment.staff.id,
                    name: appointment.staff.name,
                    avatar: appointment.staff.avatar
                } : undefined,
                services: [] // Will be populated separately if needed
            };

            return transformedAppointment;
        } catch (error) {
            console.error('Failed to update appointment staff:', error);
            throw error;
        }
    }

    /**
     * Update appointment payment status
     */
    static async updatePaymentStatus(appointmentId: string, status: 'paid' | 'pending'): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('appointments')
                .update({
                    payment_status: status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', appointmentId)
                .select();

            if (error) {
                console.error('Error updating payment status:', error);
                throw error;
            }

            return true;
        } catch (error) {
            console.error('Failed to update payment status:', error);
            throw error;
        }
    }

    /**
     * Get or create a default salon
     */
    private static async getDefaultSalonId(): Promise<string> {
        try {
            // First, try to get an existing salon
            const { data: existingSalon, error: fetchError } = await supabase
                .from('salons')
                .select('id')
                .limit(1)
                .single();

            if (existingSalon && !fetchError) {
                return existingSalon.id;
            }

            // If no salon exists, create a default one
            const { data: newSalon, error: createError } = await supabase
                .from('salons')
                .insert({
                    name: 'Default Salon',
                    activity_status: 'active',
                    is_premium: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select('id')
                .single();

            if (createError || !newSalon) {
                throw new Error('Failed to create default salon');
            }

            return newSalon.id;
        } catch (error) {
            console.error('Error getting default salon:', error);
            throw new Error('Failed to get salon ID');
        }
    }

    /**
     * Create a new appointment
     */
    static async createAppointment(appointmentData: CreateAppointmentData): Promise<AppointmentWithDetails> {
        try {
            // Get salon ID from appointmentData or from session
            let salonId = appointmentData.salon_id;
            if (!salonId && typeof window !== 'undefined') {
                const sessionData = localStorage.getItem("session");
                salonId = sessionData ? JSON.parse(sessionData).salonId : null;
            }
            // Fallback to default salon ID if still not available
            if (!salonId) {
                salonId = await this.getDefaultSalonId();
            }

            // First, get the customer details
            const { data: customer, error: customerError } = await supabase
                .from('customers')
                .select('id, name, auth_id')
                .eq('id', appointmentData.customerId)
                .single();

            if (customerError || !customer) {
                throw new Error('Customer not found');
            }

            // Get customer's phone number from users table
            let phoneNumber = null;
            if (customer.auth_id) {
                const { data: userData } = await supabase
                    .from('users')
                    .select('phone_number')
                    .eq('id', customer.auth_id)
                    .single();
                phoneNumber = userData?.phone_number || null;
            }

            // Calculate total bill
            const totalBill = appointmentData.services.reduce((sum, service) => sum + service.price, 0);

            // Create the appointment
            const { data: appointment, error: appointmentError } = await supabase
                .from('appointments')
                .insert({
                    customer_id: appointmentData.customerId,
                    customer_name: customer.name,
                    phone_number: phoneNumber,
                    staff_id: appointmentData.staffId || null,
                    salon_id: salonId,
                    date: appointmentData.date,
                    start_time: appointmentData.startTime,
                    end_time: appointmentData.endTime,
                    bill: totalBill,
                    status: 'upcoming',
                    payment_status: 'pending',
                    notes: appointmentData.notes,
                    booking_type: appointmentData.bookingType || null,
                    booking_approach: appointmentData.bookingApproach || null,
                    is_accepted: false,
                    is_rejected: false,
                    is_set_reminder: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (appointmentError) {
                console.error('Error creating appointment:', appointmentError);
                throw appointmentError;
            }

            // Create appointment services
            const appointmentServices = appointmentData.services.map(service => {
                if (service.category === 'Service') {
                    return ({
                        appointment_id: appointment.id,
                        service_id: service.serviceId,
                        price: service.price,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                }
                else if (service.category === 'Deal') {
                    return ({
                        appointment_id: appointment.id,
                        deal_id: service.serviceId,
                        // price: service.price, TODO: Add price column in appointments_deals for smooth flow
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                }
            })

            for (const service of appointmentServices) {
                if (service?.service_id) {
                    const { error: serviceError } = await supabase
                        .from('appointments_services')
                        .insert(service);

                    if (serviceError) {
                        console.error('Error creating appointment service:', serviceError);
                        throw serviceError;
                    }

                } else if (service?.deal_id) {
                    const { error: dealError } = await supabase
                        .from('appointments_deals')
                        .insert(service);

                    if (dealError) {
                        console.error('Error creating appointment deal:', dealError);
                        throw dealError;
                    }
                }
            }

            // Return the created appointment with details
            const response = await this.getAppointments({ customerId: appointmentData.customerId, salonId: salonId });
            const createdAppointment = response.data.find(apt => apt.id === appointment.id);

            return createdAppointment || {
                ...appointment,
                customer: {
                    id: customer.id,
                    name: customer.name || 'Unknown',
                    email: null,
                    phone_number: phoneNumber,
                    avatar: null
                },
                staff: {
                    id: appointmentData.staffId,
                    name: 'Unknown Staff',
                    avatar: null
                },
                services: appointmentData.services.map(s => ({
                    id: s.serviceId,
                    name: 'Unknown Service',
                    price: s.price
                }))
            };
        } catch (error) {
            console.error('Failed to create appointment:', error);
            throw error;
        }
    }

    /**
     * Update an appointment
     */
    static async updateAppointment(id: string, updates: AppointmentUpdate): Promise<AppointmentWithDetails | null> {
        try {
            const { data: appointment, error } = await supabase
                .from('appointments')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error updating appointment:', error);
                throw error;
            }

            // Return updated appointment with details
            const response = await this.getAppointments({ salonId: updates.salon_id });
            return response.data.find(apt => apt.id === id) || null;
        } catch (error) {
            console.error('Failed to update appointment:', error);
            throw error;
        }
    }

    /**
     * Delete an appointment
     */
    static async deleteAppointment(id: string): Promise<boolean> {
        try {
            // First delete appointment services
            const { error: servicesError } = await supabase
                .from('appointments_services')
                .delete()
                .eq('appointment_id', id);

            if (servicesError) {
                console.error('Error deleting appointment services:', servicesError);
                // Continue with appointment deletion
            }

            // Then delete the appointment
            const { error } = await supabase
                .from('appointments')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting appointment:', error);
                throw error;
            }

            return true;
        } catch (error) {
            console.error('Failed to delete appointment:', error);
            throw error;
        }
    }

    /**
     * Get appointment statistics
     */
    static async getAppointmentStats(): Promise<{
        totalAppointments: number;
        scheduledAppointments: number;
        completedAppointments: number;
        cancelledAppointments: number;
        totalRevenue: number;
    }> {
        try {
            const { data: appointments, error } = await supabase
                .from('appointments')
                .select('status, bill');

            if (error) {
                console.error('Error fetching appointment stats:', error);
                throw error;
            }

            const stats = {
                totalAppointments: appointments?.length || 0,
                scheduledAppointments: appointments?.filter(a => a.status === 'upcoming').length || 0,
                completedAppointments: appointments?.filter(a => a.status === 'past').length || 0,
                cancelledAppointments: appointments?.filter(a => a.status === 'cancelled').length || 0,
                totalRevenue: appointments?.reduce((sum, apt) => sum + (apt.bill || 0), 0) || 0
            };

            return stats;
        } catch (error) {
            console.error('Failed to fetch appointment stats:', error);
            throw error;
        }
    }
}
