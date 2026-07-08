import { AppHeader } from "@/components/manuscript/AppHeader";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader />
      {children}
    </div>
  );
}
