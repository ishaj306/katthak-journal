"use client";

import { useState } from "react";
import { TALAS } from "@/lib/talas";
import { LAYAS } from "@/lib/laya";

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

export function LayakariCalculator() {
  const [talaId, setTalaId] = useState("teentaal");
  const [phrase, setPhrase] = useState(16);

  const tala = TALAS.find((t) => t.id === talaId) ?? TALAS[0];
  const M = tala.matras;

  return (
    <div className="space-y-10">
      <div>
        <p className="mb-3 font-serif text-label-md uppercase tracking-widest text-secondary">
          Tala
        </p>
        <div className="flex flex-wrap gap-2">
          {TALAS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTalaId(t.id)}
              className={`border px-3 py-1.5 font-serif text-label-md transition-colors ${
                t.id === talaId
                  ? "border-primary bg-primary text-on-primary"
                  : "border-outline-variant text-on-surface-variant hover:border-secondary"
              }`}
            >
              {t.name}
              <span className="ml-1 text-[10px] opacity-70">{t.matras}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Reference table */}
      <div>
        <p className="mb-4 font-serif text-label-md uppercase tracking-widest text-secondary">
          One avartan of {tala.name} · {M} matras
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-serif">
            <thead>
              <tr className="border-b border-secondary">
                <th className="py-2 pr-4 text-left text-label-md uppercase tracking-widest text-on-surface-variant">
                  Laya
                </th>
                <th className="py-2 pr-4 text-right text-label-md uppercase tracking-widest text-on-surface-variant">
                  Bols / matra
                </th>
                <th className="py-2 pr-4 text-right text-label-md uppercase tracking-widest text-on-surface-variant">
                  Bols / avartan
                </th>
                <th className="py-2 text-right text-label-md uppercase tracking-widest text-on-surface-variant">
                  Resolves
                </th>
              </tr>
            </thead>
            <tbody>
              {LAYAS.map((l) => {
                const total = M * l.ratio;
                const whole = Number.isInteger(total);
                return (
                  <tr key={l.id} className="border-b border-outline-variant">
                    <td className="py-3 pr-4">
                      <span className="font-deva text-body-lg text-primary">
                        {l.deva}
                      </span>
                      <span className="ml-2 text-body-md text-on-surface-variant">
                        {l.name}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums text-body-md text-on-surface">
                      {fmt(l.ratio)}
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums text-body-lg text-primary">
                      {fmt(total)}
                    </td>
                    <td className="py-3 text-right">
                      {whole ? (
                        <span className="text-secondary" title="Lands cleanly on sam">
                          ✦
                        </span>
                      ) : (
                        <span
                          className="text-outline"
                          title="Does not close evenly in one avartan"
                        >
                          ·
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 font-serif text-body-md italic text-on-surface-variant">
          ✦ marks a laya that fills whole bols across one avartan of this tala.
        </p>
      </div>

      {/* Phrase converter */}
      <div className="border-t border-outline-variant pt-8">
        <p className="mb-3 font-serif text-label-md uppercase tracking-widest text-secondary">
          A phrase of
        </p>
        <div className="mb-6 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setPhrase((p) => Math.max(1, p - 1))}
            className="h-9 w-9 border border-outline-variant font-display text-headline-md leading-none text-primary hover:border-secondary"
            aria-label="Decrease"
          >
            −
          </button>
          <span className="w-12 text-center font-display text-headline-lg tabular-nums text-primary">
            {phrase}
          </span>
          <button
            type="button"
            onClick={() => setPhrase((p) => Math.min(256, p + 1))}
            className="h-9 w-9 border border-outline-variant font-display text-headline-md leading-none text-primary hover:border-secondary"
            aria-label="Increase"
          >
            +
          </button>
          <span className="font-serif text-body-md italic text-on-surface-variant">
            bols spans, at each speed:
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {LAYAS.map((l) => {
            const matras = phrase / l.ratio;
            return (
              <div
                key={l.id}
                className="border border-outline-variant bg-surface-container-lowest p-4 text-center"
              >
                <p className="font-deva text-body-lg text-secondary">{l.deva}</p>
                <p className="mt-1 font-display text-headline-md tabular-nums text-primary">
                  {fmt(matras)}
                </p>
                <p className="font-serif text-label-md uppercase tracking-widest text-on-surface-variant">
                  matras
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
