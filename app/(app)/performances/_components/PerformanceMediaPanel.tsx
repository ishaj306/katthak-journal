"use client";

import { useState } from "react";
import { PerformanceMediaUploader } from "./PerformanceMediaUploader";
import { AudioRecorder } from "@/components/manuscript/AudioRecorder";
import {
  PERFORMANCE_STAGES,
  PERFORMANCE_STAGE_LABELS,
  type MediaKind,
  type PerformanceStage,
} from "@/lib/db/types";

/**
 * The upload/record controls for one media kind, with a single stage selector
 * that tags whatever is added next — so a rehearsal video and a performance
 * video can live under the same performance, each filed to its moment in the
 * journey (Preparation → Rehearsal → Performance).
 */
export function PerformanceMediaPanel({
  performanceId,
  userId,
  kind,
}: {
  performanceId: string;
  userId: string;
  kind: MediaKind;
}) {
  const [stage, setStage] = useState<PerformanceStage>("performance");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="font-serif text-label-md uppercase tracking-widest text-on-surface-variant">
          File under
        </span>
        <div className="flex gap-2">
          {PERFORMANCE_STAGES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStage(s)}
              className={
                stage === s
                  ? "bg-primary px-3 py-0.5 font-serif text-label-md uppercase tracking-widest text-on-primary"
                  : "border border-outline-variant bg-surface px-3 py-0.5 font-serif text-label-md uppercase tracking-widest text-on-surface-variant transition-colors hover:border-secondary"
              }
            >
              {PERFORMANCE_STAGE_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <PerformanceMediaUploader
        performanceId={performanceId}
        userId={userId}
        kind={kind}
        stage={stage}
      />

      {kind === "audio" ? (
        <AudioRecorder
          bucket="performance-media"
          table="performance_media"
          parentColumn="performance_id"
          parentId={performanceId}
          userId={userId}
          extraInsert={{ stage }}
        />
      ) : null}
    </div>
  );
}
