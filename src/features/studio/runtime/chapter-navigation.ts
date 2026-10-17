import { chapters } from "../content/story";

export type ChapterId = (typeof chapters)[number]["id"];

export function createChapterNavigation() {
  let pending: ChapterId | null = null;
  return {
    request(id: string) {
      pending = chapters.find((chapter) => chapter.id === id)?.id ?? null;
    },
    take() {
      const chapter = pending;
      pending = null;
      return chapter;
    },
    cancel() {
      pending = null;
    },
  };
}
