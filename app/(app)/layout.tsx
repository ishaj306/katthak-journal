import { AppHeader } from "@/components/manuscript/AppHeader";
import { AppSpine } from "@/components/manuscript/AppSpine";
import { ToastProvider } from "@/components/manuscript/Toast";
import { CommandPalette } from "@/components/manuscript/CommandPalette";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <CommandPalette />
      <div className="flex min-h-screen bg-background">
        <AppSpine />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader />
          <div className="pb-24">{children}</div>
        </div>
      </div>
    </ToastProvider>
  );
}
