"use client";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Sun, Moon, Laptop, Upload } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import { UnauthorizedAccess } from "@/components/ui/unauthorized-access";
export function Settings() {
  const { setTheme } = useTheme();
  const { toast } = useToast();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { hasModuleAccess } = usePermissions();
  const hasAccess = hasModuleAccess("settings");
  console.log("Has settings access: ", hasAccess)
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveLogo = () => {
    if (logoPreview) {
      console.log("Saving logo...");
      toast({
        title: "Logo Saved!",
        description: "Your new logo has been saved.",
      });
    } else {
      toast({
        title: "No Logo Selected",
        description: "Please upload a logo first.",
        variant: "destructive",
      });
    }
  };

  if (hasAccess === false) {
    return <UnauthorizedAccess moduleName="Settings" />;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-left">
        <h1 className="text-4xl font-headline font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Customize the look and feel of your application.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Theme</CardTitle>
            <CardDescription>
              Select the theme for the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                Light
              </Button>
              <Button variant="outline" onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </Button>
              <Button variant="outline" onClick={() => setTheme("system")}>
                <Laptop className="mr-2 h-4 w-4" />
                System
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Logo Customization</CardTitle>
            <CardDescription>
              Upload your company's logo. It will appear in the sidebar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 border rounded-lg flex items-center justify-center bg-muted">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="h-full w-full object-contain rounded-md"
                  />
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Preview
                  </span>
                )}
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="logo-upload">Upload Logo</Label>
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
              </div>
            </div>
            <Button onClick={handleSaveLogo}>
              <Upload className="mr-2 h-4 w-4" /> Save Logo
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
