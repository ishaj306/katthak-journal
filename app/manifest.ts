import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kathak Journal",
    short_name: "Kathak",
    description:
      "A sacred archive for your Kathak journey — compositions, riyaz, performances, and guru wisdom.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#FAF6EC",
    theme_color: "#6B1E2A",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
