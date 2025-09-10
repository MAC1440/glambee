export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="dark bg-gradient-to-br from-purple-900 via-purple-900 to-black text-golden-200">
      {children}
    </main>
  );
}
