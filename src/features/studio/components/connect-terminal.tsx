"use client";
import { useId, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { connectHref, parseTerminalCommand } from "../contact/intent";
import type { ConnectIntent } from "../modules/types";
import styles from "./studio.module.css";

const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;
const intents: readonly ConnectIntent[] = ["cofound", "invest", "partner"];
export function ConnectTerminal(): React.JSX.Element {
  const ready = useSyncExternalStore(subscribe, clientReady, serverReady);
  const [command, setCommand] = useState("");
  const [output, setOutput] = useState("Choose a conversation, or type help.");
  const inputId = useId();
  const router = useRouter();
  const run = (input: string) => {
    const parsed = parseTerminalCommand(input);
    setCommand("");
    if (parsed.kind === "navigate") {
      router.push(connectHref(parsed.intent));
      return;
    }
    if (parsed.kind === "clear") {
      setOutput("");
      return;
    }
    setOutput(
      parsed.kind === "help"
        ? "help · cofound · invest · partner · clear"
        : "Unknown command. Type help for the available actions.",
    );
  };
  return (
    <section className={styles.terminal} aria-label="Conversation terminal">
      <span className={styles.eyebrow}>
        A CONVERSATION IS A GOOD FIRST COMMIT.
      </span>
      <h3>Build something that deserves to exist.</h3>
      <p>
        Find a cofounder, discuss an early hypothesis, or collaborate on a
        practical problem.
      </p>
      <div className={styles.terminalConsole}>
        <label htmlFor={inputId}>Lab command</label>
        <div className={styles.terminalInput}>
          <span aria-hidden="true">~/lab $</span>
          <input
            id={inputId}
            type="text"
            value={command}
            disabled={!ready}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={120}
            placeholder="help"
            onChange={(event) => setCommand(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                run(command);
              }
            }}
          />
          <button type="button" disabled={!ready} onClick={() => run(command)}>
            Run command
          </button>
        </div>
        <output
          role="status"
          aria-live="polite"
          data-terminal-output
          className={styles.terminalOutput}
        >
          {output}
        </output>
        <div className={styles.controls}>
          <button
            type="button"
            disabled={!ready}
            aria-label="Help terminal"
            onClick={() => run("help")}
          >
            Help
          </button>
          <button
            type="button"
            disabled={!ready}
            aria-label="Clear terminal"
            onClick={() => run("clear")}
          >
            Clear
          </button>
        </div>
      </div>
      <div className={styles.actions}>
        {intents.map((intent) => (
          <Link
            key={intent}
            href={connectHref(intent)}
            className={styles.action}
          >
            {intent[0].toUpperCase() + intent.slice(1)} ↗
          </Link>
        ))}
      </div>
    </section>
  );
}
