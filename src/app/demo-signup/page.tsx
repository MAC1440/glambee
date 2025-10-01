"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, Phone, Shield, Home } from "lucide-react";
import Link from "next/link";

export default function DemoSignupPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Enter Phone Number",
      description: "User enters their phone number and clicks 'Sign Up'",
      icon: Phone,
      status: currentStep >= 0 ? "completed" : "pending"
    },
    {
      title: "OTP Verification",
      description: "User receives OTP and enters it for verification",
      icon: Shield,
      status: currentStep >= 1 ? "completed" : "pending"
    },
    {
      title: "Dashboard Access",
      description: "User is redirected to the main dashboard",
      icon: Home,
      status: currentStep >= 2 ? "completed" : "pending"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">SalonFlow Signup Flow Demo</h1>
          <p className="text-purple-200 text-lg">
            Complete signup flow with phone number verification and OTP
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Steps Overview */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Signup Flow Steps</CardTitle>
              <CardDescription className="text-purple-200">
                Follow these steps to test the complete signup process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${
                    step.status === "completed" 
                      ? "bg-green-500" 
                      : currentStep === index 
                        ? "bg-blue-500" 
                        : "bg-gray-500"
                  }`}>
                    <step.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{step.title}</h3>
                    <p className="text-sm text-purple-200">{step.description}</p>
                  </div>
                  {step.status === "completed" && (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Demo Actions */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Test the Flow</CardTitle>
              <CardDescription className="text-purple-200">
                Click the buttons below to test each step of the signup process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button 
                  onClick={() => setCurrentStep(0)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Step 1: Start Signup
                </Button>
                
                <Button 
                  onClick={() => setCurrentStep(1)}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Step 2: Verify OTP
                </Button>
                
                <Button 
                  onClick={() => setCurrentStep(2)}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Step 3: Access Dashboard
                </Button>
              </div>

              <div className="pt-4 border-t border-white/20">
                <h4 className="font-semibold text-white mb-2">Live Demo</h4>
                <p className="text-sm text-purple-200 mb-4">
                  Try the actual signup flow with real phone number verification
                </p>
                <div className="space-y-2">
                  <Button asChild className="w-full bg-golden-600 hover:bg-golden-700 text-purple-950">
                    <Link href="/signup">
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Try Live Signup
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full border-white/30 text-white hover:bg-white/10">
                    <Link href="/">
                      <Home className="mr-2 h-4 w-4" />
                      Go to Dashboard
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Highlight */}
        <Card className="mt-8 bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Features Implemented</CardTitle>
            <CardDescription className="text-purple-200">
              Complete signup flow with modern UX patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-1">Phone Validation</h3>
                <p className="text-sm text-purple-200">Real-time phone number validation with proper formatting</p>
              </div>
              
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-1">OTP Verification</h3>
                <p className="text-sm text-purple-200">Secure OTP verification with resend functionality and countdown timer</p>
              </div>
              
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Home className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-1">Seamless Flow</h3>
                <p className="text-sm text-purple-200">Smooth transition from signup to dashboard with loading states</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
