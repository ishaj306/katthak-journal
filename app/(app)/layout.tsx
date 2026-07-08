import { AppHeader } from "@/components/manuscript/AppHeader";
import { ToastProvider } from "@/components/manuscript/Toast";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-background pb-24">
        <AppHeader />
        {children}
      </div>
    </ToastProvider>
  );
}
