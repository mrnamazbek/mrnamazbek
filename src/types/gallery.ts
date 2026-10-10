/** A deliberately curated, locally hosted photograph for the personal gallery. */
export interface GalleryPhoto {
  id: string;
  src: string;
  alt: string;
  title: string;
  caption?: string;
  width?: number;
  height?: number;
  /** Use a CSS object-position value when the subject needs a particular crop. */
  position?: string;
}
