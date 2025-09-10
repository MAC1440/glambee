import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MailCheck } from "lucide-react";

export default function AuthConfirmPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <MailCheck className="w-16 h-16 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline">
            Check your email
          </CardTitle>
          <CardDescription>
            We've sent a confirmation link to your email address. Please click
            the link to complete the sign up process.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
