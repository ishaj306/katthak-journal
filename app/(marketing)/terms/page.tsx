import Link from "next/link";
import {
  LegalFolio,
  LegalSection,
  ContactLine,
} from "@/components/manuscript/LegalFolio";
import { brand } from "@/lib/brand";

export const metadata = {
  title: `Terms of Use | ${brand.product}`,
  description: `The terms for using ${brand.product}, made by ${brand.maker}.`,
};

const list = "list-disc space-y-2 pl-6 marker:text-secondary";

export default function TermsPage() {
  return (
    <LegalFolio
      eyebrow="The agreement of the folio"
      title="Terms of Use"
      intro={`${brand.product} is designed, built and maintained by ${brand.maker}. By creating an account you agree to these simple terms.`}
    >
      <LegalSection title="Your work stays yours">
        <p>
          Every bol, composition, reflection, recording and photo you add
          remains entirely your own (or your guru&apos;s and gharana&apos;s, as
          tradition holds). Using {brand.product} gives {brand.maker} no
          ownership of it. Your content is stored only so that the app can show
          it back to you.
        </p>
      </LegalSection>

      <LegalSection title={`The app is ${brand.maker}'s`}>
        <p>
          The {brand.product} name, its Imperial Illuminated Manuscript design,
          ornaments, artwork, code and tools — including the Tihai Builder,
          Layakari Calculator and Tala Metronome — are © {brand.year}{" "}
          {brand.maker}. All rights reserved. Please don&apos;t copy, resell or
          republish them without permission.
        </p>
      </LegalSection>

      <LegalSection title="Using it well">
        <ul className={list}>
          <li>Keep your sign-in details safe; you are responsible for your account.</li>
          <li>
            Only upload material you have the right to keep — your own
            recordings, or ones your guru or fellow artists are happy for you to
            store.
          </li>
          <li>
            Don&apos;t try to access other people&apos;s data, overload the
            service, or use it for anything unlawful.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="A personal project">
        <p>
          {brand.product} is offered free of charge, with care, as it is. Every
          effort is made to keep it running and your data safe, but no service
          can promise to be perfect or always available. Keep copies of
          recordings that are irreplaceable to you. To the extent the law
          allows, {brand.maker} isn&apos;t liable for losses arising from use of
          the app.
        </p>
        <p>
          Musical tools such as the Tihai Builder and Layakari Calculator are
          aids for practice — your guru&apos;s word always comes first.
        </p>
      </LegalSection>

      <LegalSection title="Leaving">
        <p>
          You can stop using {brand.product} whenever you wish. To have your
          account and everything in it erased, <ContactLine />. Accounts that
          misuse the service may be suspended.
        </p>
      </LegalSection>

      <LegalSection title="Privacy">
        <p>
          How your data is handled is described in the{" "}
          <Link
            href="/privacy"
            className="text-primary underline decoration-secondary underline-offset-4"
          >
            Privacy Policy
          </Link>
          , which forms part of these terms.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          These terms may be updated as the app grows; the date at the top will
          always show the latest version. Continuing to use the app after a
          change means you accept the updated terms.
        </p>
      </LegalSection>
    </LegalFolio>
  );
}
