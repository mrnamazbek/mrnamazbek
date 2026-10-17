import type Lenis from "lenis";
export function connectScrollBridge({
  lenis,
  update,
  ticker,
}: {
  lenis: Pick<Lenis, "raf" | "on" | "off">;
  update: () => void;
  ticker: {
    add(fn: (seconds: number) => void): void;
    remove(fn: (seconds: number) => void): void;
  };
}): () => void {
  const tick = (seconds: number) => lenis.raf(seconds * 1000);
  let disposed = false;
  ticker.add(tick);
  lenis.on("scroll", update);
  return () => {
    if (disposed) return;
    disposed = true;
    ticker.remove(tick);
    lenis.off("scroll", update);
  };
}
