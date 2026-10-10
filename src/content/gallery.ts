import type { GalleryPhoto } from "@/types/gallery";

/** Curated public portraits. Add an optimized local asset and descriptive text here. */
export const galleryPhotos: readonly GalleryPhoto[] = [
  {
    id: "blue-portrait",
    src: "/assets/gallery/portrait-blue.webp",
    alt: "Namazbek wearing a blue shirt in a bright interior",
    title: "A little about me",
    caption: "Engineer, builder, always learning.",
    width: 896,
    height: 1200,
  },
  {
    id: "monochrome-portrait",
    src: "/assets/gallery/portrait-monochrome.webp",
    alt: "A monochrome portrait of Namazbek in a white shirt beside a car and a coastal backdrop",
    title: "In black and white",
    caption: "A different frame of mind.",
    width: 768,
    height: 1364,
  },
  {
    id: "candid-portrait",
    src: "/assets/gallery/portrait-candid.webp",
    alt: "Namazbek wearing sunglasses and a white shirt, seated in an office",
    title: "Between the projects",
    caption: "A candid moment from the everyday.",
    width: 1200,
    height: 1600,
  },
  {
    id: "formal-portrait",
    src: "/assets/gallery/portrait-formal.webp",
    alt: "A formal portrait of Namazbek wearing a grey suit and tie against a dark background",
    title: "Another perspective",
    caption: "A portrait from my personal archive.",
    width: 1400,
    height: 781,
    position: "50% 40%",
  },
];
