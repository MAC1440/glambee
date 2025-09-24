import { ComingSoon } from "@/components/ui/coming-soon";

export default function BillingPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-left">
        <h1 className="text-4xl font-headline font-bold">Billing</h1>
        <p className="text-muted-foreground mt-2">
          Manage invoices and payments.
        </p>
      </div>
      <ComingSoon 
        title="Comprehensive Billing Module"
        description="Get ready for a powerful billing dashboard, including automated invoicing, payment tracking, and detailed financial reports. Coming soon!"
      />
    </div>
  );
}
