/**
 * The label and input styling shared by the composition form and its field
 * groups. Extracted so new field groups match the existing form exactly rather
 * than re-deriving the classes.
 */

export function CustomLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1 block font-serif italic text-[14px] text-primary"
    >
      {children}
    </label>
  );
}

export const inputClass =
  "w-full border-0 border-b border-primary bg-transparent py-2 px-0 font-serif text-primary outline-none focus:border-b-2 focus:border-primary focus:ring-0";

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 font-serif text-[12px] italic text-error">{message}</p>
  );
}
