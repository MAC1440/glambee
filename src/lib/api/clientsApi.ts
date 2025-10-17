import { supabase } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/supabase";

type Customer = Database['public']['Tables']['customers']['Row'];
type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
type CustomerUpdate = Database['public']['Tables']['customers']['Update'];

export interface ClientWithDetails extends Customer {
    // Additional computed fields
    appointments?: number;
    totalSpent?: number;
    lastVisit?: string | null;
    tags?: string[];
}

export interface ClientFormData {
    name: string;
    email: string;
    phone: string;
    gender: string;
    // dob: string;
}

export interface ClientFilters {
  search?: string;
  gender?: string;
  activityStatus?: string;
  isTestUser?: boolean;
  hasSpinned?: boolean;
    limit?: number;
    offset?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    count: number;
    hasMore: boolean;
}

export class ClientsApi {
  /**
     * Get all customers with optional filtering and pagination
   */
    static async getCustomers(filters: ClientFilters = {}): Promise<PaginatedResponse<ClientWithDetails>> {
    try {
            const limit = filters.limit || 50;
            const offset = filters.offset || 0;

      let query = supabase
        .from('customers')
        .select(`
          *,
          appointments:appointments(count),
          appointments_data:appointments(
            id,
            date,
            bill,
            created_at
          )
        `, { count: 'exact' });

      // Apply filters
      if (filters.search) {
                query = query.ilike('customer_name', `%${filters.search}%`);
            }

            // Note: The customers table structure doesn't have these fields
            // They might be in a different table or need to be added
            // if (filters.gender) {
            //     query = query.eq('gender', filters.gender);
            // }

            // if (filters.activityStatus) {
            //     query = query.eq('activity_status', filters.activityStatus);
            // }

            // if (filters.isTestUser !== undefined) {
            //     query = query.eq('is_test_user', filters.isTestUser);
            // }

            // if (filters.hasSpinned !== undefined) {
            //     query = query.eq('has_spinned', filters.hasSpinned);
            // }

            const { data: customers, error, count } = await query
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }

            console.log("Customers in api: ", customers)
            // Get unique customer IDs to fetch user data
            const customerIds = customers?.map(c => c?.auth_id).filter(Boolean) || [];
            console.log("Customer ids: ", customerIds)
            console.log("First customer structure: ", customers?.[0])
            
            // Fetch user data for all customers
            let usersData: any[] = [];
            if (customerIds?.length > 0) {
                const { data: users, error: usersError } = await supabase
                    .from('users')
                    .select('id, email, phone_number, fullname, avatar')
                    .in('id', customerIds);

                console.log("Users: ", users)
                console.log("Users error: ", usersError)
                if (!usersError) {
                    usersData = users || [];
                }
            }
            console.log("User data: ", usersData)

            // Create a map for quick user lookup
            const usersMap = new Map(usersData.map(user => [user.id, user]));

            // Transform data to include stats and user data
            const customersWithStats: ClientWithDetails[] = customers?.map(customer => {
        const appointments = customer.appointments_data || [];
        const totalSpent = appointments.reduce((sum, apt) => sum + (apt.bill || 0), 0);
        const lastVisit = appointments.length > 0 
          ? appointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
          : null;

                // Get user data for this customer
                const user = customer?.auth_id ? usersMap.get(customer?.auth_id) : null;

        // Generate tags based on stats
        const tags: string[] = [];
        if (appointments.length > 5) tags.push('VIP');
                if (appointments.length <= 2) tags.push('New');
        if (totalSpent > 500) tags.push('High Spender');
                // Note: These fields don't exist in the current customers table structure
                // if (customer.is_test_user) tags.push('Test User');
                // if (customer.activity_status === 'online') tags.push('Online');

        return {
          ...customer,
                    // Include user data from the users table
                    email: user?.email || null,
                    phone_number: user?.phone_number || null,
                    name: user?.fullname || customer.name,
                    avatar: user?.avatar || null,
          appointments: appointments.length,
          totalSpent,
          lastVisit,
          tags
        };
      }) || [];

            return {
                data: customersWithStats,
                count: count || 0,
                hasMore: (offset + limit) < (count || 0)
            };
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      throw error;
    }
  }

  /**
   * Get a single customer by ID
   */
    static async getCustomerById(id: string): Promise<ClientWithDetails | null> {
    try {
      const { data: customer, error } = await supabase
        .from('customers')
        .select(`
          *,
          appointments:appointments(
            id,
            date,
            bill,
            created_at,
            status
          )
        `)
        .eq('id', id)
        .single();

            if (error || !customer) {
        return null;
      }

            // Fetch user data if customer_id exists
            let user = null;
            if (customer.auth_id) {
                const { data: userData } = await supabase
                    .from('users')
                    .select('id, email, phone_number, fullname, avatar')
                    .eq('id', customer.auth_id)
                    .single();
                user = userData;
            }

            return this.transformCustomerWithStats({ ...customer, user });
    } catch (error) {
      console.error('Failed to fetch customer:', error);
      return null;
    }
  }

  /**
   * Create a new customer
   */
    static async createCustomer(customerData: CustomerInsert): Promise<ClientWithDetails> {
    try {
      const { data: customer, error } = await supabase
        .from('customers')
                .insert({
                    ...customerData,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
        .select()
        .single();

      if (error) {
        console.error('Error creating customer:', error);
        throw error;
      }

      return {
        ...customer,
        appointments: 0,
        totalSpent: 0,
        lastVisit: null,
        tags: ['New']
      };
    } catch (error) {
      console.error('Failed to create customer:', error);
      throw error;
    }
  }

  /**
     * Create customer from form data (creates in both tables with proper FK handling)
     */
    // static async createCustomerFromForm(formData: ClientFormData): Promise<void> {
    //     try {
    //         console.log("Form data: ", formData);

    //         // First, check if user already exists with this phone number
    //         // const { data: existingUser } = await supabase
    //         //     .from('users')
    //         //     .select('id')
    //         //     .eq('phone_number', formData.phone)
    //         //     .single();

    //         // let user;
    //         // console.log("Existing user: ", existingUser)
    //         // if (existingUser) {
    //         //     // User already exists, use their ID
    //         //     user = existingUser;
    //         //     console.log("User: ", user)
    //         // }
    //         // else {
    //         //     console.log("In else cond...")
    //         // Create new user record
    //         await supabase.auth.signUp({
    //             phone: formData.phone,
    //             password: formData.phone
    //         }).then(async (res) => {
    //             console.log("In then res...")
    //             const { data: customer, error: customerError } = await supabase
    //                 .from('users')
    //                 .insert({
    //                     fullname: formData.name,
    //                     phone_number: formData.phone,
    //                     user_type: 'customer',
    //                 })
    //                 .then(async (res) => {
    //                     console.log("Res for customer: ", res)
    //                     const { data: customer, error: customerError } = await supabase
    //                         .from('customers')
    //                         .insert({
    //                             auth_id: res.data?.id || '',
    //                             gender: formData.gender
    //                         })
    //                         .select('*')
    //                         .single();
    //                 })

    //         }).catch((e) => {
    //             console.log("IN catch...")
    //             console.error('Error creating customer:', e);
    //             throw e;
    //         })

    //         // const { data: newUser, error: userError } = await supabase
    //         //     .from('users')
    //         //     .insert({
    //         //         fullname: formData.name,
    //         //         email: formData.email,
    //         //         phone_number: formData.phone,
    //         //         user_type: 'customer',
    //         //         avatar: null,
    //         //         created_at: new Date().toISOString(),
    //         //         updated_at: new Date().toISOString()
    //         //     })
    //         //     .select()
    //         //     // .single();

    //         // console.log("New user: ", newUser)
    //         // console.log("New user error: ", userError)
    //         // if (userError) {
    //         //     console.error('Error creating user:', userError);
    //         //     throw userError;
    //         // }
    //         // else {
    //         //     user = newUser;
    //         //     // console.log("In else for new user: ", user)
    //         // }
    //         // }

    //         // Check if customer already exists for this user
    //         // const { data: existingCustomer } = await supabase
    //         //     .from('customers')
    //         //     .select('id')
    //         //     .eq('auth_id', user?.id || '')
    //         //     .single();

    //         // if (existingCustomer) {
    //         //     throw new Error('Customer already exists with this phone number');
    //         // }

    //         // Create customer record with the user's ID
    //         // const { data: customer, error: customerError } = await supabase
    //         //     .from('customers')
    //         //     .insert({
    //         //         auth_id: user?.id || '',
    //         //         name: formData.name,
    //         //         gender: formData.gender,
    //         //     })
    //         //     .select()
    //         //     .single();

    //         // if (customerError) {
    //         //     console.error('Error creating customer:', customerError);
    //         //     throw customerError;
    //         // }

    //         // return {
    //         //     ...customer,
    //         //     // ...customer,
    //         //     appointments: 0,
    //         //     totalSpent: 0,
    //         //     lastVisit: null,
    //         //     tags: ['New']
    //         // };
    //     } catch (error) {
    //         console.error('Failed to create customer from form:', error);
    //         throw error;
    //     }
    // }
    static async createCustomerFromForm(formData: ClientFormData): Promise<ClientWithDetails | null> {
        try {
            // Step 1: Check if email already exists
            const { data: existingEmailUser } = await supabase
                .from('users')
                .select('id, email')
                .eq('email', formData.email)
                .single();

            if (existingEmailUser) {
                throw new Error('A user with this email address already exists');
            }

            // Step 2: Check if phone number already exists
            const { data: existingPhoneUser } = await supabase
                .from('users')
                .select('id, phone_number')
                .eq('phone_number', formData.phone)
                .single();

            if (existingPhoneUser) {
                throw new Error('A user with this phone number already exists');
            }

            // Step 3: Create auth user
            const result = await supabase.auth
                .signUp({
                    phone: formData.phone,
                    password: formData.phone,
                })
                .then(async ({ data: authData, error: signUpError }) => {
                    console.log("Auth data: ", authData)
                    if (signUpError) throw signUpError;

                    const user = authData.user;

                    // Step 4: Create entry in public.users
                    const { data: userData, error: userError } = await supabase
                        .from("users")
                        .insert({
                            id: user?.id, // link auth user
                            phone_number: formData.phone, // Use formData.phone which includes the + prefix
                            email: formData.email,
                            fullname: formData.name,
                            user_type: 'customer',
                        })
                        .select()
                        .single();

                    console.log("User data: ", userData)
                    if (userError) throw userError;

                    // Step 5: Create related customer
                    const { data: customerData, error: customerError } = await supabase
                        .from("customers")
                        .insert({
                            auth_id: userData.id, // link to public.users.id
                            name: formData.name,
                            gender: formData.gender,
                        })
                        .select()
                        .single();

                    console.log("Customer data: ", customerData)
                    if (customerError) throw customerError;

                    console.log("✅ Customer created successfully:", customerData);
                    return customerData;
                });

            return result;
        } catch (e) {
            console.error("❌ Error in catch: ", e);
            throw e;
        }
    }


    /**
     * Update a customer (updates both customers and users tables)
     */
    static async updateCustomer(id: string, updates: CustomerUpdate): Promise<ClientWithDetails | null> {
        try {
            // First, get the current customer to find the auth_id
            const { data: currentCustomer, error: fetchError } = await supabase
                .from('customers')
                .select('auth_id')
                .eq('id', id)
                .single();

            if (fetchError || !currentCustomer) {
                console.error('Error fetching current customer:', fetchError);
                throw new Error('Customer not found');
            }

            // Update the customers table
            const { data: customer, error: customerError } = await supabase
        .from('customers')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
        .eq('id', id)
        .select()
        .single();

            if (customerError) {
                console.error('Error updating customer:', customerError);
                throw customerError;
            }

            // If we have user data to update and auth_id exists, update the users table
            if (currentCustomer.auth_id && (updates.name || updates.gender)) {
                const userUpdates: any = {};
                
                // Map customer fields to user fields
                if (updates.name) {
                    userUpdates.fullname = updates.name;
                }
                
                const { error: userError } = await supabase
                    .from('users')
                    .update({
                        ...userUpdates,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', currentCustomer.auth_id);

                if (userError) {
                    console.error('Error updating user:', userError);
                    // Don't throw here, as the customer update succeeded
                    console.warn('Customer updated but user update failed:', userError);
                }
            }

            // Fetch the updated customer with user data
      return await this.getCustomerById(id);
    } catch (error) {
      console.error('Failed to update customer:', error);
      throw error;
    }
  }

    /**
     * Update customer from form data (updates both customers and users tables)
     */
    static async updateCustomerFromForm(id: string, formData: ClientFormData): Promise<ClientWithDetails | null> {
        try {
            console.log("🚀 Starting comprehensive client update...");
            console.log("Form data: ", formData);
            
            // First, get the current customer to find the auth_id
            const { data: currentCustomer, error: fetchError } = await supabase
                .from('customers')
                .select('auth_id')
                .eq('id', id)
                .single();

            console.log("Current customer: ", currentCustomer)
            console.log("Fetch error: ", fetchError)
            if (fetchError || !currentCustomer) {
                console.error('Error fetching current customer:', fetchError);
                throw new Error('Customer not found');
            }

            // Update the customers table
            const { data: customer, error: customerError } = await supabase
                .from('customers')
                .update({
                    name: formData.name,
                    gender: formData.gender,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (customerError) {
                console.error('Error updating customer:', customerError);
                throw customerError;
            }

            // Update the users table if auth_id exists
            if (currentCustomer.auth_id) {
                const { error: userError } = await supabase
                    .from('users')
                    .update({
                        fullname: formData.name,
                        email: formData.email,
                        phone_number: formData.phone,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', currentCustomer.auth_id);

                if (userError) {
                    console.error('Error updating user:', userError);
                    // Don't throw here, as the customer update succeeded
                    console.warn('Customer updated but user update failed:', userError);
                }
            }

            // Fetch the updated customer with user data
            const updatedClient = await this.getCustomerById(id);
            console.log("✅ Client updated successfully:", updatedClient);
            return updatedClient;
        } catch (error) {
            console.error('Failed to update customer from form:', error);
            throw error;
        }
    }

  /**
   * Delete a customer
   */
  static async deleteCustomer(id: string): Promise<boolean> {
    try {
            // First get the customer to find auth_id
            const { data: customer } = await supabase
                .from('customers')
                .select('auth_id')
                .eq('id', id)
                .single();

            if (customer?.auth_id) {
                // Delete from users table first (due to foreign key constraint)
                const { error: userError } = await supabase
                    .from('users')
                    .delete()
                    .eq('id', customer.auth_id);

                if (userError) {
                    console.error('Error deleting user:', userError);
                    throw userError;
                }
            }

            // Then delete from customers table
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting customer:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete customer:', error);
      throw error;
    }
  }

  /**
   * Get customer statistics
   */
    static async getCustomerStats(): Promise<{
        totalClients: number;
        activeClients: number;
        newClientsThisMonth: number;
        testUsers: number;
    }> {
        try {
            const { data: customers, error } = await supabase
        .from('customers')
        .select('id, activity_status, is_test_user, created_at');

      if (error) {
        console.error('Error fetching customer stats:', error);
        throw error;
      }

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            const stats = {
        totalClients: customers?.length || 0,
        activeClients: customers?.filter(c => c.activity_status === 'online').length || 0,
        newClientsThisMonth: customers?.filter(c => 
          new Date(c.created_at) >= thisMonth
        ).length || 0,
        testUsers: customers?.filter(c => c.is_test_user).length || 0
      };

      return stats;
    } catch (error) {
      console.error('Failed to fetch customer stats:', error);
      throw error;
    }
  }

  /**
     * Search customers by name
   */
    static async searchCustomers(searchTerm: string): Promise<ClientWithDetails[]> {
    try {
            const { data: customers, error } = await supabase
        .from('customers')
        .select(`
          *,
          appointments:appointments(count),
          appointments_data:appointments(
            id,
            date,
            bill,
            created_at
          )
        `)
                .ilike('customer_name', `%${searchTerm}%`)
                .limit(10);

      if (error) {
        console.error('Error searching customers:', error);
        throw error;
      }

            // Get unique customer IDs to fetch user data
            const customerIds = customers?.map(c => c.auth_id).filter(Boolean) || [];
            
            // Fetch user data for all customers
            let usersData: any[] = [];
            if (customerIds.length > 0) {
                const { data: users, error: usersError } = await supabase
                    .from('users')
                    .select('id, email, phone_number, fullname, avatar')
                    .in('id', customerIds);
                
                if (!usersError) {
                    usersData = users || [];
                }
            }

            // Create a map for quick user lookup
            const usersMap = new Map(usersData.map(user => [user.id, user]));

            return customers?.map(customer => {
                const user = customer.auth_id ? usersMap.get(customer.auth_id) : null;
                return this.transformCustomerWithStats({ ...customer, user });
      }) || [];
    } catch (error) {
      console.error('Failed to search customers:', error);
      throw error;
    }
  }

  /**
   * Update customer activity status
   */
  static async updateActivityStatus(id: string, status: 'online' | 'offline'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('customers')
                .update({
                    activity_status: status,
                    updated_at: new Date().toISOString()
                })
        .eq('id', id);

      if (error) {
        console.error('Error updating activity status:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to update activity status:', error);
      throw error;
    }
  }

  /**
     * Helper function to transform customer data with stats
     */
    private static transformCustomerWithStats(customer: any): ClientWithDetails {
        const appointments = customer.appointments || [];
        const totalSpent = appointments.reduce((sum: number, apt: any) => sum + (apt.bill || 0), 0);
        const lastVisit = appointments.length > 0
            ? appointments.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
            : null;

        // Generate tags based on stats
        const tags: string[] = [];
        if (appointments.length > 5) tags.push('VIP');
        if (appointments.length > 0 && appointments.length <= 2) tags.push('New');
        if (totalSpent > 500) tags.push('High Spender');
        // Note: These fields don't exist in the current customers table structure
        // if (customer.is_test_user) tags.push('Test User');
        // if (customer.activity_status === 'online') tags.push('Online');

        return {
            ...customer,
            // Include user data from the joined users table
            email: customer.user?.email || null,
            phone_number: customer.user?.phone_number || customer.phone_number || null,
            name: customer.user?.fullname || customer.customer_name,
            fullname: customer.user?.fullname || customer.customer_name,
            avatar: customer.user?.avatar || null,
            appointments: appointments.length,
            totalSpent,
            lastVisit,
            tags
        };
    }
}

// All types are already exported above in their interface declarations
