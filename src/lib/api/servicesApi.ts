import { api } from './baseApi';
import { services } from '../placeholder-data';

// Example of an API slice that injects endpoints into the baseApi
export const servicesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getServices: builder.query<any[], void>({
      queryFn: () => {
        // Using queryFn to return mock data since we don't have a real backend
        // In a real app, you would use the `query` property:
        // query: () => 'services', 
        return { data: services };
      },
    }),
  }),
  overrideExisting: false,
});

// Export hooks for usage in components
export const { useGetServicesQuery } = servicesApi;
