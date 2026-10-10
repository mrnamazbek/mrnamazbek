import type { ReactNode } from "react";

export function PageHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="page-heading">
      <p className="eyebrow">
        <span className="label-dot" />
        {eyebrow}
      </p>
      <h1>{title}</h1>
      {children && <div className="page-intro">{children}</div>}
    </header>
  );
}

export function SectionHeading({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{number} / EXPLORE</p>
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}
