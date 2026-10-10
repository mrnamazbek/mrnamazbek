"use client";

import { useRef, useState, type PointerEvent } from "react";
import { ArrowDownToLine, Copy, GitBranch, Plus, Trash2 } from "lucide-react";

type Node = {
  id: string;
  kind: "source" | "transform" | "destination";
  label: string;
  x: number;
  y: number;
};
type Edge = { from: string; to: string };
const initialNodes: Node[] = [
  { id: "source_1", kind: "source", label: "Raw data", x: 135, y: 185 },
  { id: "transform_2", kind: "transform", label: "Transform", x: 400, y: 185 },
  {
    id: "destination_3",
    kind: "destination",
    label: "Warehouse",
    x: 665,
    y: 185,
  },
];
const initialEdges: Edge[] = [
  { from: "source_1", to: "transform_2" },
  { from: "transform_2", to: "destination_3" },
];
function hasCycle(nodes: Node[], edges: Edge[]) {
  const visited = new Set<string>();
  const active = new Set<string>();
  const visit = (id: string): boolean => {
    if (active.has(id)) return true;
    if (visited.has(id)) return false;
    active.add(id);
    for (const edge of edges.filter((item) => item.from === id)) {
      if (visit(edge.to)) return true;
    }
    active.delete(id);
    visited.add(id);
    return false;
  };
  return nodes.some((node) => visit(node.id));
}

export function PipelineBuilder() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [mode, setMode] = useState("select");
  const [selected, setSelected] = useState("");
  const [status, setStatus] = useState("");
  const [showExport, setShowExport] = useState(false);
  const [from, setFrom] = useState("source_1");
  const [to, setTo] = useState("destination_3");
  const count = useRef(4);
  const canvas = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    id: string;
    moved: boolean;
    startX: number;
    startY: number;
  } | null>(null);
  const connect = (start: string, end: string) => {
    if (!start || !end || start === end) {
      setStatus("Choose two different tasks.");
      return;
    }
    if (edges.some((edge) => edge.from === start && edge.to === end)) {
      setStatus("These tasks are already connected.");
      return;
    }
    const next = [...edges, { from: start, to: end }];
    if (hasCycle(nodes, next)) {
      setStatus("That connection would create a cycle. A DAG must be acyclic.");
      return;
    }
    setEdges(next);
    setStatus("Connection added.");
  };
  const removeNode = (id: string) => {
    setNodes((items) => items.filter((node) => node.id !== id));
    setEdges((items) =>
      items.filter((edge) => edge.from !== id && edge.to !== id),
    );
    setSelected("");
    setStatus("Task removed.");
  };
  const activate = (id: string) => {
    if (mode === "delete") {
      removeNode(id);
      return;
    }
    if (mode === "connect" && selected && selected !== id) {
      connect(selected, id);
      setSelected("");
    } else {
      setSelected(id);
      setStatus(
        mode === "connect"
          ? "Now choose the downstream task."
          : "Use arrow keys to move this task, or drag it.",
      );
    }
  };
  const add = (kind: Node["kind"]) => {
    if (nodes.length >= 20) {
      setStatus("This playground supports up to 20 tasks.");
      return;
    }
    const number = count.current++;
    const id = `${kind}_${number}`;
    setNodes((items) => [
      ...items,
      {
        id,
        kind,
        label: `${kind[0].toUpperCase()}${kind.slice(1)} ${number}`,
        x: 120 + ((number - 4) % 3) * 270,
        y: 290 + (Math.floor((number - 4) / 3) % 2) * 55,
      },
    ]);
    setStatus("Task added.");
  };
  const move = (event: PointerEvent<HTMLButtonElement>) => {
    const current = drag.current;
    if (
      !current ||
      current.id !== event.currentTarget.dataset.id ||
      !canvas.current
    )
      return;
    const rect = canvas.current.getBoundingClientRect();
    if (
      Math.abs(event.clientX - current.startX) +
        Math.abs(event.clientY - current.startY) <
        4 &&
      !current.moved
    )
      return;
    current.moved = true;
    const x = Math.max(
      65,
      Math.min(735, ((event.clientX - rect.left) / rect.width) * 800),
    );
    const y = Math.max(
      55,
      Math.min(350, ((event.clientY - rect.top) / rect.height) * 400),
    );
    setNodes((items) =>
      items.map((node) => (node.id === current.id ? { ...node, x, y } : node)),
    );
  };
  const output = `# A generated Airflow scaffold. Replace EmptyOperator with real tasks.\nfrom airflow import DAG\nfrom airflow.providers.standard.operators.empty import EmptyOperator\nfrom datetime import datetime\n\nwith DAG(\n    dag_id="my_data_pipeline",\n    start_date=datetime(2026, 1, 1),\n    schedule=None,\n    catchup=False,\n) as dag:\n${nodes.map((node) => `    ${node.id} = EmptyOperator(task_id="${node.id}")`).join("\n")}\n\n${edges.map((edge) => `    ${edge.from} >> ${edge.to}`).join("\n")}\n`;
  const download = () => {
    if (!nodes.length) {
      setStatus("Add a task before exporting.");
      return;
    }
    const url = URL.createObjectURL(new Blob([output], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "my_data_pipeline.py";
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="tool-panel">
      <div className="tool-heading">
        <p className="eyebrow">05 / CONNECT THE DOTS</p>
        <h2>Pipeline architect</h2>
        <p>
          Sketch a data flow, connect tasks, then export an Airflow scaffold.
          Drag tasks or use the keyboard.
        </p>
      </div>
      <div className="pipeline-toolbar">
        <div className="filter-tabs">
          {["select", "connect", "delete"].map((item) => (
            <button
              type="button"
              aria-pressed={mode === item}
              className={mode === item ? "active" : ""}
              key={item}
              onClick={() => {
                setMode(item);
                setSelected("");
              }}
            >
              {item[0].toUpperCase()}
              {item.slice(1)}
            </button>
          ))}
        </div>
        <div className="button-row">
          {(["source", "transform", "destination"] as const).map((kind) => (
            <button
              className="small-button"
              key={kind}
              onClick={() => add(kind)}
            >
              <Plus size={12} />
              {kind}
            </button>
          ))}
          <button
            className="small-button"
            onClick={() => {
              setNodes([]);
              setEdges([]);
              setSelected("");
              setStatus("Canvas cleared.");
            }}
          >
            <Trash2 size={12} />
            Clear
          </button>
        </div>
      </div>
      <div className="pipeline-canvas" ref={canvas}>
        <svg
          viewBox="0 0 800 400"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <marker
              id="dag-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
            </marker>
          </defs>
          {edges.map((edge) => {
            const start = nodes.find((node) => node.id === edge.from);
            const end = nodes.find((node) => node.id === edge.to);
            return start && end ? (
              <path
                key={`${edge.from}-${edge.to}`}
                d={`M ${start.x + 50} ${start.y} C ${start.x + 110} ${start.y}, ${end.x - 110} ${end.y}, ${end.x - 56} ${end.y}`}
                stroke="currentColor"
                fill="none"
                markerEnd="url(#dag-arrow)"
              />
            ) : null;
          })}
        </svg>
        {nodes.map((node) => (
          <button
            type="button"
            data-id={node.id}
            key={node.id}
            aria-label={`${node.kind}: ${node.label}`}
            aria-pressed={selected === node.id}
            className={`pipeline-node node-${node.kind} ${selected === node.id ? "selected" : ""}`}
            style={{ left: `${node.x / 8}%`, top: `${node.y / 4}%` }}
            onClick={(event) => {
              if (event.detail === 0) activate(node.id);
            }}
            onPointerDown={(event) => {
              if (mode === "select") {
                event.currentTarget.setPointerCapture(event.pointerId);
                drag.current = {
                  id: node.id,
                  moved: false,
                  startX: event.clientX,
                  startY: event.clientY,
                };
              }
            }}
            onPointerMove={move}
            onPointerUp={() => {
              const moved = drag.current?.moved;
              drag.current = null;
              if (!moved) activate(node.id);
            }}
            onPointerCancel={() => {
              drag.current = null;
            }}
            onKeyDown={(event) => {
              const direction: Record<string, [number, number]> = {
                ArrowLeft: [-15, 0],
                ArrowRight: [15, 0],
                ArrowUp: [0, -15],
                ArrowDown: [0, 15],
              };
              if (direction[event.key]) {
                event.preventDefault();
                const [dx, dy] = direction[event.key];
                setNodes((items) =>
                  items.map((item) =>
                    item.id === node.id
                      ? {
                          ...item,
                          x: Math.max(65, Math.min(735, item.x + dx)),
                          y: Math.max(55, Math.min(350, item.y + dy)),
                        }
                      : item,
                  ),
                );
              }
              if (event.key === "Delete") removeNode(node.id);
            }}
          >
            <span className="mono">{node.kind}</span>
            <GitBranch size={18} />
            <strong>{node.label}</strong>
          </button>
        ))}
      </div>
      <div className="pipeline-connect-form">
        <div className="field">
          <label htmlFor="dag-from">From task</label>
          <select
            id="dag-from"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
          >
            <option value="">Choose a task</option>
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="dag-to">To task</label>
          <select
            id="dag-to"
            value={to}
            onChange={(event) => setTo(event.target.value)}
          >
            <option value="">Choose a task</option>
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.label}
              </option>
            ))}
          </select>
        </div>
        <button
          className="small-button"
          onClick={() =>
            connect(
              nodes.some((node) => node.id === from) ? from : "",
              nodes.some((node) => node.id === to) ? to : "",
            )
          }
        >
          Add connection
        </button>
      </div>
      <div className="pipeline-bottom">
        <button
          className="small-button"
          onClick={() =>
            setStatus(
              nodes.length
                ? hasCycle(nodes, edges)
                  ? "A cycle was found."
                  : `Valid DAG: ${nodes.length} tasks and ${edges.length} connections.`
                : "Add a task to build a DAG.",
            )
          }
        >
          Validate graph
        </button>
        <button
          className="small-button"
          onClick={() => setShowExport((value) => !value)}
        >
          View Airflow code
        </button>
        <button className="small-button" onClick={download}>
          <ArrowDownToLine size={13} />
          Download DAG
        </button>
        <p role="status" className="tool-status">
          {status}
        </p>
      </div>
      {edges.length > 0 && (
        <details className="edge-list">
          <summary>Manage {edges.length} connections</summary>
          {edges.map((edge) => (
            <div key={`${edge.from}-${edge.to}`}>
              <span>
                {nodes.find((node) => node.id === edge.from)?.label} →{" "}
                {nodes.find((node) => node.id === edge.to)?.label}
              </span>
              <button
                className="small-button"
                aria-label={`Remove connection ${edge.from} to ${edge.to}`}
                onClick={() =>
                  setEdges((items) => items.filter((item) => item !== edge))
                }
              >
                <Trash2 size={12} />
                Remove
              </button>
            </div>
          ))}
        </details>
      )}
      {showExport && (
        <div className="dag-export">
          <div className="code-toolbar">
            <span className="mono">my_data_pipeline.py</span>
            <button
              className="small-button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(output);
                  setStatus("Airflow scaffold copied.");
                } catch {
                  setStatus(
                    "Clipboard unavailable. Select the code to copy it.",
                  );
                }
              }}
            >
              <Copy size={13} />
              Copy code
            </button>
          </div>
          <pre className="code-output">
            <code>{output}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
