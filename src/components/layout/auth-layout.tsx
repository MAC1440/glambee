export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="dark bg-gradient-to-br from-[#3b0764] via-[#2c0b4b] to-[#1a052e] text-golden-200">
      {children}
    </main>
  );
}
