"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileFormState } from "@/app/actions/profile";
import { useToast } from "@/components/manuscript/Toast";
import { GHARANAS, GHARANA_LABELS, type Profile } from "@/lib/db/types";
import { useEffect, useRef } from "react";

const initial: ProfileFormState = {};
const inputClass =
  "w-full border-0 border-b border-primary bg-transparent py-2 font-serif text-body-md text-primary focus:outline-none";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(updateProfile, initial);
  const { toast } = useToast();
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      toast("Profile saved");
    }
    wasPending.current = pending;
  }, [pending, state.error, toast]);

  return (
    <form action={formAction} className="space-y-8">
      <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
        <div>
          <label className="mb-1 block font-serif italic text-[14px] text-primary">
            Name
          </label>
          <input
            name="display_name"
            defaultValue={profile.display_name ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block font-serif italic text-[14px] text-primary">
            Primary Guru
          </label>
          <input
            name="primary_guru"
            defaultValue={profile.primary_guru ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block font-serif italic text-[14px] text-primary">
            Gharana
          </label>
          <select
            name="gharana"
            defaultValue={profile.gharana ?? ""}
            className={inputClass}
          >
            <option value="">—</option>
            {GHARANAS.map((g) => (
              <option key={g} value={g}>
                {GHARANA_LABELS[g]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block font-serif italic text-[14px] text-primary">
            Dance journey began
          </label>
          <input
            name="dance_start_date"
            type="date"
            defaultValue={profile.dance_start_date ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block font-serif italic text-[14px] text-primary">
            City
          </label>
          <input
            name="city"
            defaultValue={profile.city ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block font-serif italic text-[14px] text-primary">
            Country
          </label>
          <input
            name="country"
            defaultValue={profile.country ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block font-serif italic text-[14px] text-primary">
          Short bio
        </label>
        <textarea
          name="bio"
          rows={4}
          defaultValue={profile.bio ?? ""}
          placeholder="A few words about your dance…"
          className="w-full border border-outline-variant bg-transparent p-3 font-serif text-body-md text-primary focus:border-primary focus:outline-none"
        />
      </div>

      {state.error ? (
        <p className="font-serif text-body-md italic text-error">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="border border-primary bg-primary px-10 py-3 font-serif text-label-md uppercase tracking-widest text-on-primary transition-all hover:bg-primary-container disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save Profile"}
      </button>
    </form>
  );
}
