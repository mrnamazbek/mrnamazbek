import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { galleryPhotos } from "@/content/gallery";
import { PhotoGallery } from "@/components/gallery/photo-gallery";
import { CollectionHeading } from "@/components/liquid-glass/collections";
import { GlassSurface } from "@/components/liquid-glass/surface";
import styles from "@/components/liquid-glass/collections.module.css";

export const metadata: Metadata = {
  title: "Gallery · Liquid Glass",
  description: "A personal archive of portraits and everyday moments from Namazbek Bekzhanov.",
  alternates: { canonical: "/gallery" },
};

export default function GlassGalleryPage() {
  return (
    <div className={styles.page}>
      <CollectionHeading
        eyebrow="Personal archive"
        title="A life beyond the work."
        count={galleryPhotos.length}
        countLabel="portraits"
      >
        <p>
          A few portraits. A few different perspectives. Small moments from my
          personal archive, collected in a new light.
        </p>
      </CollectionHeading>
      <GlassSurface className={styles.galleryPanel}>
        <PhotoGallery
          photos={galleryPhotos}
          title="In the frame."
          intro="Swipe through the photographs, or select one for a closer look."
        />
      </GlassSurface>
      <div className={styles.afterword}>
        <p>The person behind the pipelines.</p>
        <Link href="/v2/about">Read my story <ArrowUpRight size={17} aria-hidden="true" /></Link>
      </div>
    </div>
  );
}
