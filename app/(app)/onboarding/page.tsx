import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getOrCreateProfile } from "@/lib/profile";
import { OnboardingWizard } from "./OnboardingWizard";

export const metadata = {
  title: "Welcome | Kathak Journal",
};

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const profile = await getOrCreateProfile(userId);
  if (profile?.onboarded) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-3xl items-center px-margin-mobile py-12 md:px-margin-page">
      <div className="relative w-full border border-secondary bg-surface p-[2px] shadow-xl">
        <div
          className="pointer-events-none absolute"
          style={{
            top: "4px",
            left: "4px",
            right: "4px",
            bottom: "4px",
            border: "1px solid #4e0616",
          }}
          aria-hidden
        />
        <div className="relative p-8 md:p-12">
          <OnboardingWizard />
        </div>
      </div>
    </main>
  );
}
