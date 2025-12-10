
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
  name: z.string()
    .min(5, { message: "Name must be at least 5 characters." })
    .max(30, { message: "Name must not exceed 30 characters." })
    .refine((val) => val.trim().length > 0, {
      message: "Name cannot be only whitespace."
    })
    .refine((val) => !val.startsWith(' ') && !val.endsWith(' '), {
      message: "Name cannot start or end with spaces."
    }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string()
    .min(10, { message: "Phone number must be at least 10 digits." })
    .max(15, { message: "Phone number can't be longer than 15 digits." })
    .regex(/^\+[0-9]+$/, { message: "Phone number must start with + and contain only numbers." }),
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
  isLoading?: boolean; // Add loading state prop
};

export function ClientForm({ client, onSave, onCancel, isLoading = false }: ClientFormProps) {
  const { toast } = useToast();
  
  const form = useForm<ClientFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: client?.name || "",
      email: client?.email || "",
      phone: client?.phone_number?.startsWith('+') ? client.phone_number : `+${client?.phone_number || ''}`,
      gender: client?.gender || undefined,
      // dob: client?.dob ? new Date(client.dob) : undefined,
    },
  });

  const onSubmit = async (values: ClientFormData) => {
      // If nothing changed, do nothing (no API call, no toast) and close dialog
      if (!form.formState.isDirty) {
        onCancel();
        return;
      }

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
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
                      +
                    </span>
                    <Input 
                      type="tel" 
                      placeholder="1 (555) 123-4567" 
                      className="pl-8"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={field.value?.replace('+', '') || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        field.onChange('+' + value);
                      }}
                      onKeyDown={(e) => {
                        // Allow: backspace, delete, tab, escape, enter, home, end, left, right
                        if ([8, 9, 27, 13, 46, 35, 36, 37, 39].indexOf(e.keyCode) !== -1 ||
                            // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                            (e.keyCode === 65 && e.ctrlKey === true) ||
                            (e.keyCode === 67 && e.ctrlKey === true) ||
                            (e.keyCode === 86 && e.ctrlKey === true) ||
                            (e.keyCode === 88 && e.ctrlKey === true)) {
                          return;
                        }
                        // Ensure that it is a number and stop the keypress
                        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </div>
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
                    {/* <SelectItem value="Prefer not to say">Prefer not to say</SelectItem> */}
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
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !form.formState.isDirty}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
