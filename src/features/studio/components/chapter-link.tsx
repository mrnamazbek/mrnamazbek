"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import type { ChapterId } from "../runtime/chapter-navigation";
import { useStudioChapterNavigation } from "../runtime/studio-runtime";

export function ChapterLink({
  chapter,
  children,
  ...props
}: Omit<ComponentProps<"a">, "href"> & { chapter: ChapterId }) {
  const pathname = usePathname();
  const navigation = useStudioChapterNavigation();
  const href = `/studio#${chapter}`;
  return pathname === "/studio" ? (
    <a {...props} href={href}>
      {children}
    </a>
  ) : (
    <Link {...props} href={href} onNavigate={() => navigation.request(chapter)}>
      {children}
    </Link>
  );
}
