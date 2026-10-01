import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

export const metadata = {
  title: "Begin Your Journal | Kathak Journal",
};

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="flex w-full max-w-3xl flex-col overflow-hidden border border-secondary/20 bg-surface p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <h1 className="font-display text-display-lg-mobile tracking-tighter text-primary md:text-display-lg">
            Begin your journal
          </h1>
          <p className="mt-4 font-serif text-body-lg italic text-on-surface-variant">
            Your first folio awaits the touch of your hand.
          </p>
        </div>
        <div className="mx-auto w-full max-w-md">
          <SignUp
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0 bg-transparent",
              },
            }}
          />
        </div>
        <p className="mt-6 text-center font-serif text-[15px] italic text-on-surface-variant">
          By creating an account you agree to the{" "}
          <Link href="/terms" className="text-primary underline decoration-secondary underline-offset-4">
            Terms of Use
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary underline decoration-secondary underline-offset-4">
            Privacy Policy
          </Link>
          . Your entries are private to you.
        </p>
      </div>
    </main>
  );
}
