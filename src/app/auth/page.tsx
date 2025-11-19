import { Auth } from "@/features/auth/Auth";
import { Suspense } from "react";

function AuthContent() {
  return <Auth />;
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
