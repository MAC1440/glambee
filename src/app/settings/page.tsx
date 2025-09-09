
"use client";
import { useState, useEffect } from "react";
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
import { Paintbrush, Upload } from "lucide-react";

const themes = [
  { name: "Default", primary: "339 49% 68%", background: "338 56% 95%", accent: "279 45% 72%" },
  { name: "Ocean", primary: "210 40% 50%", background: "210 40% 96%", accent: "190 50% 70%" },
  { name: "Forest", primary: "140 35% 45%", background: "140 10% 94%", accent: "110 30% 65%" },
  { name: "Sunset", primary: "25 80% 60%", background: "30 60% 95%", accent: "50 85% 70%" },
  { name: "Plum", primary: "270 50% 60%", background: "270 30% 96%", accent: "290 55% 75%" },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const [selectedTheme, setSelectedTheme] = useState(themes[0]);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleThemeChange = (theme: typeof themes[0]) => {
    setSelectedTheme(theme);
    if (typeof window !== "undefined") {
      document.documentElement.style.setProperty("--primary", theme.primary);
      document.documentElement.style.setProperty("--background", theme.background);
      document.documentElement.style.setProperty("--accent", theme.accent);
    }
  };

  const handleSaveTheme = () => {
    // In a real app, you would save this to a database
    console.log("Saving theme:", selectedTheme.name);
    toast({
      title: "Theme Saved!",
      description: `The ${selectedTheme.name} theme has been applied and saved.`,
    });
  }

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
    // In a real app, you would upload this file to a storage service
    // and save the URL to the database.
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
            variant: "destructive"
        });
    }
  };

  // Set the initial theme on component mount
  useEffect(() => {
    handleThemeChange(selectedTheme);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            <CardTitle>Theme Customization</CardTitle>
            <CardDescription>
              Choose a color palette that matches your brand.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              {themes.map((theme) => (
                <div key={theme.name} className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => handleThemeChange(theme)}
                    className={`h-16 w-16 rounded-lg border-4 flex items-center justify-center ${
                      selectedTheme.name === theme.name
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: `hsl(${theme.background})` }}
                  >
                    <div
                      className="h-8 w-8 rounded-full"
                      style={{ backgroundColor: `hsl(${theme.primary})` }}
                    ></div>
                  </button>
                  <span className="text-sm font-medium">{theme.name}</span>
                </div>
              ))}
            </div>
             <Button onClick={handleSaveTheme}>
                <Paintbrush className="mr-2 h-4 w-4" /> Save Theme
            </Button>
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
                        <img src={logoPreview} alt="Logo Preview" className="h-full w-full object-contain rounded-md" />
                    ) : (
                        <span className="text-sm text-muted-foreground">Preview</span>
                    )}
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="logo-upload">Upload Logo</Label>
                    <Input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} />
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
