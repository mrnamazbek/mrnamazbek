"use client";

import { useId, useReducer } from "react";
import { ArrowRight, RotateCcw, Send } from "lucide-react";
import styles from "./connection-pool.module.css";

const poolSize = 3;
const queueLimit = 6;
type PoolState = {
  connections: (number | null)[];
  waiting: number[];
  completed: number;
  nextRequest: number;
  message: string;
};
type PoolAction = "request" | "complete" | "reset";

const initialState: PoolState = {
  connections: Array.from({ length: poolSize }, () => null),
  waiting: [],
  completed: 0,
  nextRequest: 1,
  message: "Send a request to borrow the first connection.",
};

function updatePool(state: PoolState, action: PoolAction): PoolState {
  if (action === "reset") return initialState;
  if (action === "request") {
    const free = state.connections.indexOf(null);
    if (free < 0 && state.waiting.length >= queueLimit) {
      return { ...state, message: "The waiting room is full. Complete a query to make space." };
    }
    const request = state.nextRequest;
    if (free >= 0) {
      return {
        ...state,
        nextRequest: request + 1,
        connections: state.connections.map((value, index) => index === free ? request : value),
        message: `Request ${request} borrowed connection ${free + 1}.`,
      };
    }
    return {
      ...state,
      nextRequest: request + 1,
      waiting: [...state.waiting, request],
      message: `Request ${request} is waiting for a free connection.`,
    };
  }
  const active = state.connections.filter((value): value is number => value !== null);
  if (!active.length) return state;
  const finished = Math.min(...active);
  const slot = state.connections.indexOf(finished);
  const next = state.waiting[0] ?? null;
  return {
    ...state,
    connections: state.connections.map((value, index) => index === slot ? next : value),
    waiting: state.waiting.slice(1),
    completed: state.completed + 1,
    message: next === null
      ? `Request ${finished} completed. Connection ${slot + 1} is free again.`
      : `Request ${finished} completed. Waiting request ${next} now uses connection ${slot + 1}.`,
  };
}

function point(x: number, y: number, z: number) {
  return [320 + (x - y) * 0.8660254, 326 + (x + y) * 0.5 - z];
}
function polygon(points: number[][]) {
  return points.map(([x, y]) => `${x},${y}`).join(" ");
}

function Block({ x, y, z, width, depth, height, className = "" }: {
  x: number; y: number; z: number; width: number; depth: number; height: number; className?: string;
}) {
  const a = point(x, y, z + height);
  const b = point(x + width, y, z + height);
  const c = point(x + width, y + depth, z + height);
  const d = point(x, y + depth, z + height);
  return <g className={`${styles.block} ${className}`}>
    <polygon className={styles.side} points={polygon([b, c, point(x + width, y + depth, z), point(x + width, y, z)])} />
    <polygon className={styles.front} points={polygon([d, c, point(x + width, y + depth, z), point(x, y + depth, z)])} />
    <polygon className={styles.top} points={polygon([a, b, c, d])} />
  </g>;
}

function PoolInstrument({ connections, waiting }: Pick<PoolState, "connections" | "waiting">) {
  const titleId = useId();
  const descriptionId = useId();
  return <svg className={styles.instrument} viewBox="0 0 640 470" role="img" aria-labelledby={`${titleId} ${descriptionId}`}>
    <title id={titleId}>A three-connection pool with a waiting room</title>
    <desc id={descriptionId}>
      {connections.filter((value) => value !== null).length} connections are busy, {waiting.length} requests are waiting.
      Three server cartridges stand on a bench above six waiting-room positions.
    </desc>
    <ellipse className={styles.shadow} cx="310" cy="377" rx="226" ry="57" />
    {[-160, 138].flatMap((x) => [-86, 102].map((y) =>
      <Block key={`${x}-${y}`} x={x} y={y} z={-14} width={22} depth={22} height={14} className={styles.foot} />
    ))}
    <Block x={-185} y={-112} z={0} width={370} depth={252} height={14} className={styles.base} />
    {[-169, 169].flatMap((x) => [-96, 124].map((y) => {
      const [cx, cy] = point(x, y, 14);
      return <circle key={`${x}-${y}`} cx={cx} cy={cy} r="3" className={styles.screw} />;
    }))}
    <Block x={-137} y={-69} z={14} width={276} depth={116} height={8} className={styles.rail} />
    <Block x={-137} y={-70} z={22} width={276} depth={8} height={17} className={styles.rail} />
    {connections.map((request, index) => {
      const x = -128 + index * 91;
      const busy = request !== null;
      return <g key={index} data-pool-connection={index + 1} data-busy={busy}>
        <Block x={x} y={-53} z={22} width={74} depth={91} height={139} className={busy ? styles.busy : styles.cabinet} />
        <Block x={x + 9} y={-41} z={161} width={56} depth={67} height={4} className={styles.cap} />
        {[10, 57].map((offset) => <Block key={offset} x={x + offset} y={-29} z={165} width={7} depth={15} height={8} className={styles.connector} />)}
        {[0, 1, 2, 3, 4, 5, 6].map((vent) => {
          const [x1, y1] = point(x + 13, 38, 54 + vent * 8);
          const [x2, y2] = point(x + 61, 38, 54 + vent * 8);
          return <line key={vent} x1={x1} y1={y1} x2={x2} y2={y2} className={styles.vent} />;
        })}
        {[8, 66].flatMap((offset) => [31, 153].map((z) => {
          const [cx, cy] = point(x + offset, 38, z);
          return <circle key={`${offset}-${z}`} cx={cx} cy={cy} r="2" className={styles.screw} />;
        }))}
        <Block x={x + 12} y={38} z={121} width={50} depth={4} height={18} className={styles.labelPlate} />
        {(() => {
          const [cx, cy] = point(x + 24, 43, 129);
          return <circle cx={cx} cy={cy} r="4" className={busy ? styles.lightOn : styles.lightOff} />;
        })()}
        {(() => {
          const [x1, y1] = point(x + 38, 43, 129);
          const [x2, y2] = point(x + 52, 43, 129);
          return <line x1={x1} y1={y1} x2={x2} y2={y2} className={styles.nameplate} />;
        })()}
        <Block x={x + 10} y={39} z={28} width={54} depth={5} height={12} className={styles.handle} />
      </g>;
    })}
    <Block x={-137} y={86} z={14} width={276} depth={40} height={8} className={styles.rail} />
    {Array.from({ length: queueLimit }, (_, index) => {
      const x = -130 + index * 45;
      const occupied = waiting[index] !== undefined;
      return <g key={index} data-pool-waiting={index + 1} data-occupied={occupied}>
        <Block x={x} y={91} z={22} width={36} depth={30} height={3} className={styles.slot} />
        <Block x={x + 4} y={95} z={25} width={28} depth={22} height={occupied ? 13 : 2} className={occupied ? styles.request : styles.emptyRequest} />
        {[8, 15, 22].map((offset) => {
          const [x1, y1] = point(x + offset, 117, occupied ? 34 : 26);
          const [x2, y2] = point(x + offset, 117, occupied ? 29 : 25);
          return <line key={offset} x1={x1} y1={y1} x2={x2} y2={y2} className={styles.chipLine} />;
        })}
      </g>;
    })}
  </svg>;
}

export function ConnectionPool() {
  const [state, dispatch] = useReducer(updatePool, initialState);
  const headingId = useId();
  const busy = state.connections.filter((value) => value !== null).length;
  return <section className="content-section" id="connection-pool" aria-labelledby={headingId}>
    <div className="section-heading">
      <div>
        <p className="eyebrow">INTERACTIVE / SYSTEM ANATOMY</p>
        <h2 id={headingId}>A pool, in three slots.</h2>
      </div>
      <span className="mono muted">BORROW → QUERY → RETURN</span>
    </div>
    <div className={styles.card}>
      <figure className={styles.figure}>
        <div className={styles.figureHeading}><span>FIG. 01</span><span>CONNECTION POOL</span></div>
        <PoolInstrument connections={state.connections} waiting={state.waiting} />
        <figcaption className={styles.figureFooter}>
          <span><i className={styles.legendBusy} /> Borrowed</span>
          <span><i className={styles.legendFree} /> Available</span>
          <span>{state.waiting.length} / {queueLimit} waiting</span>
        </figcaption>
      </figure>
      <div className={styles.controls}>
        <p className="eyebrow">SMALL CAPACITY. SHARED EFFICIENTLY.</p>
        <h3>One connection. One request at a time.</h3>
        <p className={styles.explanation}>Fill the three slots, then send another request. It waits until a query finishes and returns its connection to the pool.</p>
        <dl className={styles.readout}>
          <div><dt>Connections busy</dt><dd data-testid="pool-busy">{busy} / {poolSize}</dd></div>
          <div><dt>Waiting</dt><dd data-testid="pool-waiting">{state.waiting.length}</dd></div>
          <div><dt>Completed</dt><dd data-testid="pool-completed">{state.completed}</dd></div>
        </dl>
        <ol className={styles.connections} aria-label="Connection assignments">
          {state.connections.map((request, index) => <li key={index}>
            <span className={request === null ? styles.freeIndicator : styles.busyIndicator} />
            <span>Connection {index + 1}</span><strong>{request === null ? "Available" : `Request ${request}`}</strong>
          </li>)}
        </ol>
        <div className={styles.actions}>
          <button type="button" className={styles.send} onClick={() => dispatch("request")}><Send size={15} /> Send request</button>
          <button type="button" disabled={busy === 0} onClick={() => dispatch("complete")}><ArrowRight size={15} /> Complete one query</button>
          <button type="button" className={styles.reset} onClick={() => dispatch("reset")} aria-label="Reset connection pool"><RotateCcw size={15} /></button>
        </div>
        <p role="status" className={styles.status}>{state.message}</p>
        <p className={styles.note}>Illustrative model: 3 connections and a 6-request waiting room. Requests stay in your browser.</p>
      </div>
    </div>
  </section>;
}
