"use client";

import { useState } from "react";
import { TALAS, LAYA_VALUES, LAYA_LABELS, talaById } from "@/lib/talas";
import type { Composition } from "@/lib/db/types";
import { CustomLabel, inputClass, FieldError } from "./formPrimitives";

/** Sentinel for the picker only — never stored. */
const CUSTOM = "__custom__";

/**
 * Taal, matra and lay for a composition.
 *
 * Choosing a built-in taal fills the matra count for you (Teentaal → 16), but
 * the field stays editable — a composition can sit in a shortened cycle, and
 * some talas are counted differently between gharanas. "Another taal" reveals a
 * free-text name so a taal outside the built-in list is still recordable.
 *
 * The visible picker is `tala_choice` and is not submitted to the database; the
 * hidden `tala_id` carries the real value, empty when the taal is custom.
 */
export function TaalFields({
  existing,
  errors,
}: {
  existing?: Composition;
  errors?: { tala_id?: string; tala_name?: string; matras?: string };
}) {
  const startsCustom = !existing?.tala_id && !!existing?.tala_name;
  const [choice, setChoice] = useState<string>(
    startsCustom ? CUSTOM : (existing?.tala_id ?? "")
  );
  const [matras, setMatras] = useState<string>(
    existing?.matras != null ? String(existing.matras) : ""
  );

  const isCustom = choice === CUSTOM;

  function onTaalChange(value: string) {
    setChoice(value);
    const tala = talaById(value);
    // Fill the matra count from the taal, but never overwrite a number the
    // dancer typed themselves.
    if (tala && matras.trim() === "") setMatras(String(tala.matras));
  }

  return (
    <>
      <input type="hidden" name="tala_id" value={isCustom ? "" : choice} />

      <div>
        <CustomLabel htmlFor="tala_choice">Taal</CustomLabel>
        <select
          id="tala_choice"
          value={choice}
          onChange={(e) => onTaalChange(e.target.value)}
          className={inputClass + " text-body-md"}
        >
          <option value="">—</option>
          {TALAS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} · {t.matras} matras
            </option>
          ))}
          <option value={CUSTOM}>Another taal…</option>
        </select>
        <FieldError message={errors?.tala_id} />
      </div>

      {isCustom ? (
        <div>
          <CustomLabel htmlFor="tala_name">Taal Name</CustomLabel>
          <input
            id="tala_name"
            name="tala_name"
            type="text"
            defaultValue={existing?.tala_name ?? ""}
            placeholder="e.g. Pancham Sawari"
            className={inputClass + " text-body-md"}
          />
          <FieldError message={errors?.tala_name} />
        </div>
      ) : null}

      <div>
        <CustomLabel htmlFor="matras">Matras</CustomLabel>
        <input
          id="matras"
          name="matras"
          type="number"
          min={1}
          max={128}
          value={matras}
          onChange={(e) => setMatras(e.target.value)}
          placeholder="16"
          className={inputClass + " text-body-md"}
        />
        <FieldError message={errors?.matras} />
      </div>

      <div>
        <CustomLabel htmlFor="lay">Lay</CustomLabel>
        <select
          id="lay"
          name="lay"
          defaultValue={existing?.lay ?? ""}
          className={inputClass + " text-body-md"}
        >
          <option value="">—</option>
          {LAYA_VALUES.map((l) => (
            <option key={l} value={l}>
              {LAYA_LABELS[l]}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
