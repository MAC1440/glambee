"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { services, staff } from "@/lib/placeholder-data";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";

const FormSchema = z.object({
  serviceId: z.string({ required_error: "Please select a service." }),
  staffId: z.string({ required_error: "Please select a staff member." }),
  date: z.date({ required_error: "Please select a date." }),
  time: z.string({ required_error: "Please select a time slot." }),
});

const timeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
];

export function BookingForm() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data);
    setSubmitted(true);
    toast({
      title: "Appointment Booked!",
      description: "We've confirmed your appointment. See you soon!",
    });
  }

  if (submitted) {
    return (
      <Card className="w-full max-w-lg">
        <CardContent className="pt-6 text-center flex flex-col items-center gap-4">
          <CheckCircle className="w-16 h-16 text-green-500" />
          <h2 className="text-2xl font-semibold">Booking Confirmed!</h2>
          <p className="text-muted-foreground">
            Your appointment has been successfully booked. You'll receive a confirmation email shortly.
          </p>
          <Button onClick={() => setSubmitted(false)}>Book Another Appointment</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          Select Your Options
        </CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="serviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="staffId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staff</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a staff member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {staff.map((staff) => (
                          <SelectItem key={staff.id} value={staff.id}>
                            {staff.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <FormLabel>Available Times</FormLabel>
                 <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                        {timeSlots.map((time) => (
                        <Button
                            key={time}
                            type="button"
                            variant={field.value === time ? 'default' : 'outline'}
                            onClick={() => field.onChange(time)}
                        >
                            {time}
                        </Button>
                        ))}
                    </div>
                    )}
                />
                <FormMessage className="mt-2">{form.formState.errors.time?.message}</FormMessage>
              </div>
            </div>
            <div>
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <FormLabel className="text-center mb-2">
                      Choose a Date
                    </FormLabel>
                    <FormControl>
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                        className="rounded-md border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" size="lg" className="w-full md:w-auto">
              Confirm Booking
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
