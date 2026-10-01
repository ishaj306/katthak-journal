import {
  LegalFolio,
  LegalSection,
  ContactLine,
} from "@/components/manuscript/LegalFolio";
import { brand } from "@/lib/brand";

export const metadata = {
  title: `Privacy Policy | ${brand.product}`,
  description: `How ${brand.product} keeps your compositions, recordings and reflections private.`,
};

const list = "list-disc space-y-2 pl-6 marker:text-secondary";

export default function PrivacyPage() {
  return (
    <LegalFolio
      eyebrow="Your folio, your keeping"
      title="Privacy Policy"
      intro={`${brand.product} is a personal project made by ${brand.maker}. Your manuscript belongs to you — this page explains, in plain words, what is stored and how it is protected.`}
    >
      <LegalSection title="The short version">
        <ul className={list}>
          <li>Your entries are private. No other user can see them — not even other dancers using the app.</li>
          <li>There are no ads, no trackers and no analytics scripts.</li>
          <li>Your data is never sold, rented or shared for marketing.</li>
          <li>Your compositions are never used to train AI or shown to anyone else.</li>
          <li>You can ask for everything to be deleted at any time.</li>
        </ul>
      </LegalSection>

      <LegalSection title="What is stored">
        <ul className={list}>
          <li>
            <strong>Account details</strong> — your name, email address and sign-in
            method, so you can log in.
          </li>
          <li>
            <strong>What you write</strong> — compositions, journal entries, riyaz
            sessions, performances, guru wisdom, lineage, costumes and profile
            details you choose to add.
          </li>
          <li>
            <strong>What you upload</strong> — audio, video, photos and PDFs you
            attach, and riyaz recordings you make in the app.
          </li>
        </ul>
        <p>
          Nothing else is collected about you. The microphone is used only while
          you are actively recording, and only after your browser asks your
          permission.
        </p>
      </LegalSection>

      <LegalSection title="How it is protected">
        <ul className={list}>
          <li>
            Every row in the database is locked to its owner with row-level
            security — the database itself refuses to return one dancer&apos;s
            entries to anyone else.
          </li>
          <li>
            Uploaded media lives in private storage. Files are shown to you
            through short-lived signed links that expire on their own.
          </li>
          <li>All traffic is encrypted in transit over HTTPS.</li>
          <li>
            Text you write is sanitised before display, so nothing harmful can be
            injected into your pages.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Trusted services">
        <p>
          A small number of well-established providers run the plumbing. They
          process data only to provide their service, never for their own
          purposes:
        </p>
        <ul className={list}>
          <li><strong>Clerk</strong> — secure sign-in and account management.</li>
          <li><strong>Supabase</strong> — the database and private file storage.</li>
          <li><strong>Vercel</strong> — hosting the website (served from Mumbai, India).</li>
        </ul>
      </LegalSection>

      <LegalSection title="Cookies & your device">
        <p>
          Only the cookies needed to keep you signed in are used — there are no
          advertising or tracking cookies. The app may save its own design files
          (fonts, icons, scripts) on your device so it opens quickly; your
          entries are not cached there.
        </p>
      </LegalSection>

      <LegalSection title="Your choices">
        <ul className={list}>
          <li>Edit or delete any entry or upload yourself, whenever you like.</li>
          <li>Export a composition as a PDF from its page.</li>
          <li>
            To delete your whole account and everything in it, or to ask what is
            stored about you, <ContactLine />. It will be done promptly and
            completely.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          Young dancers are welcome with a parent or guardian&apos;s involvement.
          If you are under 13, please ask a parent or guardian to create and
          manage the account for you.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          If this policy changes, the date at the top will be updated. Anything
          that meaningfully changes how your data is handled will be announced
          in the app first.
        </p>
      </LegalSection>

      <LegalSection title="Questions">
        <p>
          For any question about your privacy, <ContactLine />.
        </p>
      </LegalSection>
    </LegalFolio>
  );
}
