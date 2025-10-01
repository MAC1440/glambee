// Login page temporarily disabled - using unified welcome/signup flow
// import { Login } from "@/features/auth/Login";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center text-golden-200">
        <h1 className="text-2xl font-bold mb-4">Login Temporarily Disabled</h1>
        <p className="text-golden-400/80 mb-4">
          Please use the signup page for authentication
        </p>
        <a 
          href="/auth" 
          className="inline-block bg-golden-600 hover:bg-golden-700 text-purple-950 px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Go to Signup
        </a>
      </div>
    </div>
  );
}
