
"use client";

import { useState } from "react";
import { ClientSearch } from "./ClientSearch";
import { ClientFound } from "./ClientFound";
import { ClientNotFound } from "./ClientNotFound";
import { appointments, mockCustomers } from "@/lib/placeholder-data";

// Mock user type for prototype
type Customer = {
  phone: string;
  name: string;
  email: string;
};

export function Appointments() {
  const [searchState, setSearchState] = useState<
    "idle" | "searching" | "found" | "notFound"
  >("idle");
  const [searchedPhone, setSearchedPhone] = useState("");
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null);

  const handleSearch = (phone: string) => {
    setSearchState("searching");
    setFoundCustomer(null);
    setSearchedPhone(phone);

    setTimeout(() => {
      const customer = mockCustomers.find((c) => c.phone === phone);
      if (customer) {
        setFoundCustomer(customer);
        setSearchState("found");
      } else {
        setSearchState("notFound");
      }
    }, 500);
  };

  const handleRegister = (newCustomer: Omit<Customer, "phone">) => {
    const customerWithPhone = { ...newCustomer, phone: searchedPhone };
    // In a real app, you would save this to your database.
    // For now, we'll just add it to our mock data for this session.
    mockCustomers.push(customerWithPhone);
    setFoundCustomer(customerWithPhone);
    setSearchState("found");
  };

  const handleReset = () => {
    setSearchState("idle");
    setSearchedPhone("");
    setFoundCustomer(null);
  }

  if (searchState === "found" && foundCustomer) {
    const customerAppointments = appointments.filter(
      (apt) => apt.customer.email === foundCustomer.email
    );
    return (
      <ClientFound
        customer={foundCustomer}
        appointments={customerAppointments}
        onBack={handleReset}
      />
    );
  }

  if (searchState === "notFound") {
    return (
      <ClientNotFound
        phone={searchedPhone}
        onRegister={handleRegister}
        onBack={handleReset}
      />
    );
  }

  return (
    <ClientSearch
      onSearch={handleSearch}
      isSearching={searchState === "searching"}
      mockCustomers={mockCustomers}
    />
  );
}
