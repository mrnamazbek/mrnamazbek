"use client";
import type { ModuleViewProps } from "../modules/types";
import type { ModuleSlug } from "../modules/types";
import dynamic from "next/dynamic";
import { Component, type ComponentType } from "react";
import styles from "./studio.module.css";

function ModuleLoading() {
  return (
    <section className={styles.workbench} aria-label="Loading workbench">
      <p>The initial fixture is ready. Preparing the interactive controls…</p>
      <button type="button" disabled>
        Preparing workbench
      </button>
    </section>
  );
}

const views: Record<ModuleSlug, ComponentType<ModuleViewProps>> = {
  "form-workbench": dynamic(() => import("../modules/form-workbench/view"), {
    ssr: false,
    loading: ModuleLoading,
  }),
  "locale-inspector": dynamic(
    () => import("../modules/locale-inspector/view"),
    {
      ssr: false,
      loading: ModuleLoading,
    },
  ),
  "interface-lab": dynamic(() => import("../modules/interface-lab/view"), {
    ssr: false,
    loading: ModuleLoading,
  }),
  architecture: dynamic(() => import("../modules/architecture/view"), {
    ssr: false,
    loading: ModuleLoading,
  }),
  "data-explorer": dynamic(() => import("../modules/data-explorer/view"), {
    ssr: false,
    loading: ModuleLoading,
  }),
  "policy-workflow": dynamic(() => import("../modules/policy-workflow/view"), {
    ssr: false,
    loading: ModuleLoading,
  }),
};

class ModuleBoundary extends Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <section className={styles.workbench}>
        <h2>The enhancement could not load.</h2>
        <p>
          The read-only fixture and navigation remain available. Reloading
          clears any edits held in memory.
        </p>
        <button type="button" onClick={() => window.location.reload()}>
          Reload page to retry workbench
        </button>
      </section>
    );
  }
}
export function ModuleLoader({
  definition,
}: ModuleViewProps): React.JSX.Element {
  const View = views[definition.slug];
  return (
    <ModuleBoundary key={definition.slug}>
      <View definition={definition} />
    </ModuleBoundary>
  );
}
