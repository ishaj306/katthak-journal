"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary for errors in the root layout itself (where the app's
 * own error.tsx can't render). Must include <html>/<body>.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAF6EC",
          color: "#6B1E2A",
          fontFamily: "Georgia, 'Times New Roman', serif",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <h1 style={{ fontSize: "1.75rem", fontStyle: "italic" }}>
          The manuscript could not open
        </h1>
        <p style={{ color: "#877273", maxWidth: "28rem" }}>
          An unexpected error occurred while loading Kathak Journal. Please
          reload the page.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: "1.5rem",
            border: "1px solid #6B1E2A",
            background: "#6B1E2A",
            color: "#FAF6EC",
            padding: "0.75rem 2rem",
            font: "inherit",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            cursor: "pointer",
          }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
