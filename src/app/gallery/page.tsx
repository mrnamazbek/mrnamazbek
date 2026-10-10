import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHeading } from "@/components/ui/page-heading";
import { PhotoGallery } from "@/components/gallery/photo-gallery";
import { galleryPhotos } from "@/content/gallery";

export const metadata: Metadata = {
  title: "Gallery",
  description: "A small personal archive of portraits and everyday moments from Namazbek Bekzhanov.",
};

export default function GalleryPage() {
  return (
    <>
      <PageHeading eyebrow="04 / PERSONAL ARCHIVE" title="A life beyond the work.">
        <p>A few portraits, a few different perspectives. Small moments from my personal archive.</p>
      </PageHeading>
      <PhotoGallery photos={galleryPhotos} title="In the frame." intro="Swipe through the photographs, or select one for a closer look." />
      <div className="gallery-afterword">
        <p className="eyebrow">THE PERSON BEHIND THE PIPELINES</p>
        <Link href="/about" className="text-link">Read my story <ArrowUpRight size={17} /></Link>
      </div>
    </>
  );
}
