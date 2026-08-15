import { AppHeader } from "@/components/manuscript/AppHeader";
import { AppSpine } from "@/components/manuscript/AppSpine";
import { ToastProvider } from "@/components/manuscript/Toast";
import { CommandPalette } from "@/components/manuscript/CommandPalette";

/**
 * Every page in this section is per-authenticated-user and reads the Clerk
 * session (via headers), so none of them can be statically prerendered.
 * Declaring the whole subtree dynamic stops Next from attempting static
 * generation at build time — which is what produced the harmless but noisy
 * "Dynamic server usage … used headers" / "Failed to set initial Realtime auth
 * token" messages in the Vercel build log.
 */
export const dynamic = "force-dynamic";

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
