
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ClientsApi } from "@/lib/api/clientsApi";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export type Client = {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  gender: string;
  // dob: string;
};

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  gender: z.string({ required_error: "Please select a gender." }),
  // dob: z.date({
  //   required_error: "A date of birth is required.",
  // }),
});

export type ClientFormData = z.infer<typeof formSchema>;

type ClientFormProps = {
  client?: Client;
  onSave: (clientData: any) => void; // Using any to avoid complex type casting on submit
  onCancel: () => void;
};

export function ClientForm({ client, onSave, onCancel }: ClientFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<ClientFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: client?.name || "",
      email: client?.email || "",
      phone: client?.phone_number || "",
      gender: client?.gender || undefined,
      // dob: client?.dob ? new Date(client.dob) : undefined,
    },
  });
  console.log("Form: ", form)

  const onSubmit = async (values: ClientFormData) => {
      const formData = {
        ...values,
        // dob: values.dob.toISOString().split('T')[0]
      };
      onSave(formData);
  };
  // const onSubmit = async (values: ClientFormData) => {
  //   setIsLoading(true);
  //   try {
  //     // Convert date object back to string for consistency
  //     const formData = {
  //       ...values,
  //       // dob: values.dob.toISOString().split('T')[0]
  //     };

  //     const newClient = await ClientsApi.createCustomerFromForm(formData);
      
  //     toast({
  //       title: "Client Created",
  //       description: `${values.name} has been successfully added.`,
  //     });

  //     // Call the onSave callback with the created client data
  //     // onSave(newClient);
  //     onSave(formData);
  //   } catch (error: any) {
  //     console.error('Error creating client:', error);
      
  //     // Handle specific error messages
  //     let errorMessage = "Failed to create client. Please try again.";
      
  //     if (error.message?.includes('duplicate key')) {
  //       errorMessage = "A client with this phone number already exists.";
  //     } else if (error.message?.includes('signup')) {
  //       errorMessage = "Failed to create account. Please check your phone number.";
  //     } else if (error.message) {
  //       errorMessage = error.message;
  //     }
      
  //     toast({
  //       title: "Error",
  //       description: errorMessage,
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Jane Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="jane@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="+1 (555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem className="flex flex-col md:mt-2.5">
                <FormLabel>Date of Birth</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal ",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50 " />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      captionLayout="dropdown-buttons"
                      fromYear={2000}
                      toYear={2035}
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          /> */}
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  );
}
