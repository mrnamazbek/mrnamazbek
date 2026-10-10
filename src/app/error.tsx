"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="page-heading empty-state">
      <p className="eyebrow">A BRIEF INTERRUPTION</p>
      <h1>
        Let’s try that again<span className="accent">.</span>
      </h1>
      <p>
        This page couldn’t load. You can try again or contact me directly at{" "}
        <a href="mailto:namazbekzhan@gmail.com">namazbekzhan@gmail.com</a>.
      </p>
      <button onClick={reset} className="button button-primary">
        Try again
      </button>
    </section>
  );
}
