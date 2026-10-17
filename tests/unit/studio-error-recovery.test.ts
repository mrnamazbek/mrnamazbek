import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import { JsxEmit, ModuleKind, transpileModule } from "typescript";
import type { ReactElement, ReactNode } from "react";

type ElementProps = { children?: ReactNode; onClick?: () => void };

function findButton(node: ReactNode): ReactElement<ElementProps> | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const match = findButton(child);
      if (match) return match;
    }
    return;
  }
  if (!node || typeof node !== "object" || !("type" in node)) return;
  const element = node as ReactElement<ElementProps>;
  if (element.type === "button") return element;
  return findButton(element.props.children);
}

test("Studio route recovery refetches the segment through Next retry", () => {
  const require = createRequire(resolve("package.json"));
  const source = readFileSync("src/app/studio/error.tsx", "utf8");
  const compiled = transpileModule(source, {
    compilerOptions: { module: ModuleKind.CommonJS, jsx: JsxEmit.ReactJSX },
  });
  const exports: {
    default?: (props: { retry: () => void; reset: () => void }) => ReactNode;
  } = {};
  runInNewContext(compiled.outputText, {
    exports,
    require: (name: string) => {
      if (name === "next/link") return { default: "a" };
      if (name.endsWith(".module.css")) return { default: {} };
      return require(name);
    },
  });
  assert.ok(exports.default);
  let retries = 0;
  let resets = 0;
  const button = findButton(
    exports.default({
      retry: () => retries++,
      reset: () => resets++,
    }),
  );
  assert.ok(button?.props.onClick, "the native recovery button is actionable");
  button.props.onClick();
  assert.equal(retries, 1, "retry must refetch the failed segment");
  assert.equal(resets, 0, "cached contents must not be reused for recovery");
});
