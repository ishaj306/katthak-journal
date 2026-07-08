import { SignIn } from "@clerk/nextjs";

export const metadata = {
  title: "Sign In | Kathak Journal",
};

export default function SignInPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="flex w-full max-w-6xl flex-col overflow-hidden border border-secondary/20 bg-surface shadow-2xl md:flex-row">
        {/* Left visual panel */}
        <section className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-ivory p-12 md:flex">
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 30%, rgba(184,137,62,0.2) 0%, transparent 60%), radial-gradient(circle at 70% 70%, rgba(107,30,42,0.15) 0%, transparent 60%)",
            }}
          />
          <div className="relative z-10 flex h-full w-full items-center justify-center border border-secondary bg-white/10">
            <div className="absolute left-2 top-2 text-secondary opacity-60">
              <span className="material-symbols-outlined text-[32px]">
                filter_vintage
              </span>
            </div>
            <div className="absolute right-2 top-2 text-secondary opacity-60">
              <span className="material-symbols-outlined text-[32px]">
                filter_vintage
              </span>
            </div>
            <div className="absolute bottom-2 left-2 text-secondary opacity-60">
              <span className="material-symbols-outlined text-[32px]">
                filter_vintage
              </span>
            </div>
            <div className="absolute bottom-2 right-2 text-secondary opacity-60">
              <span className="material-symbols-outlined text-[32px]">
                filter_vintage
              </span>
            </div>

            <div className="flex h-4/5 w-4/5 flex-col items-center justify-center text-center text-secondary">
              <span
                className="material-symbols-outlined text-[96px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                self_improvement
              </span>
              <p className="mt-6 font-display text-[18px] italic opacity-70">
                Welcome back, dancer
              </p>
            </div>
          </div>
          <div className="absolute left-1/2 top-8 z-20 -translate-x-1/2">
            <span className="bg-ivory px-4 font-serif text-[14px] font-semibold uppercase tracking-[0.3em] text-secondary">
              Parampara
            </span>
          </div>
        </section>

        {/* Clerk SignIn */}
        <section className="flex w-full flex-col items-center justify-center bg-surface p-6 md:w-1/2 md:p-10">
          <div className="mb-6 text-center md:hidden">
            <h1 className="font-display text-display-lg-mobile tracking-tighter text-primary">
              Kathak Journal
            </h1>
          </div>
          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full max-w-md",
                card: "shadow-none border-0 bg-transparent",
              },
            }}
          />
          <blockquote className="mt-8 max-w-sm text-center font-serif text-body-md italic leading-relaxed opacity-60">
            &ldquo;The rhythm is not in the feet, but in the soul that moves
            them.&rdquo;
            <footer className="mt-2 block font-serif text-label-md not-italic uppercase tracking-widest text-secondary">
              — Traditional
            </footer>
          </blockquote>
        </section>
      </div>
      <footer className="mt-8 text-center opacity-40">
        <p className="font-serif text-[12px] italic uppercase tracking-widest">
          © MMXXIV KATHAK JOURNAL. PRESERVING THE SACRED RHYTHM.
        </p>
      </footer>
    </main>
  );
}
