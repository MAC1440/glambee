
import { signup } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SalonFlowLogo } from "@/components/icons";

export function Signup() {
  return (
    <div className="flex items-center justify-center min-h-screen">
       <Card className="w-full max-w-sm bg-black/30 border-golden-700/50 text-golden-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <SalonFlowLogo className="h-12 w-12 text-golden-400" />
          </div>
          <CardTitle className="text-2xl font-headline text-golden-300">Create an Account</CardTitle>
          <CardDescription className="text-golden-400/80">
            Enter your phone number to get started.
          </CardDescription>
        </CardHeader>
        <form>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                name="phone"
                placeholder="+15551234567"
                required
                className="bg-black/50 border-golden-700/50 text-golden-200 placeholder:text-golden-400/60"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button formAction={signup} className="w-full bg-golden-600 hover:bg-golden-700 text-purple-950">
              Sign Up
            </Button>
            <div className="text-sm text-center text-golden-400/80">
              Already have an account?{" "}
              <Link href="/login" className="underline text-golden-300 hover:text-golden-200">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
