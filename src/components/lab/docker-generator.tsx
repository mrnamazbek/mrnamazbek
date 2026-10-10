"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";

const databases = {
  postgres: {
    label: "PostgreSQL",
    image: "postgres",
    version: "16",
    port: 5432,
    volume: "/var/lib/postgresql/data",
  },
  mysql: {
    label: "MySQL",
    image: "mysql",
    version: "8.4",
    port: 3306,
    volume: "/var/lib/mysql",
  },
  mongodb: {
    label: "MongoDB",
    image: "mongo",
    version: "7",
    port: 27017,
    volume: "/data/db",
  },
  redis: {
    label: "Redis",
    image: "redis",
    version: "7",
    port: 6379,
    volume: "/data",
  },
};
type Database = keyof typeof databases;
const yamlValue = (value: string) =>
  JSON.stringify(value.replaceAll("$", "$$"));

export function DockerGenerator() {
  const [database, setDatabase] = useState<Database>("postgres");
  const [version, setVersion] = useState("16");
  const [port, setPort] = useState("5432");
  const [name, setName] = useState("mydb");
  const [user, setUser] = useState("developer");
  const [password, setPassword] = useState("");
  const [copyState, setCopyState] = useState("");
  const config = databases[database];
  const safeVersion = /^[a-zA-Z0-9._-]+$/.test(version)
    ? version
    : config.version;
  const safePort = Math.max(
    1,
    Math.min(65535, Number.parseInt(port) || config.port),
  );
  const pw = password
    ? yamlValue(password)
    : '"${DATABASE_PASSWORD:?Set DATABASE_PASSWORD in .env}"';
  const environment =
    database === "postgres"
      ? `    environment:\n      POSTGRES_DB: ${yamlValue(name)}\n      POSTGRES_USER: ${yamlValue(user)}\n      POSTGRES_PASSWORD: ${pw}\n`
      : database === "mysql"
        ? `    environment:\n      MYSQL_DATABASE: ${yamlValue(name)}\n      MYSQL_USER: ${yamlValue(user)}\n      MYSQL_PASSWORD: ${pw}\n      MYSQL_ROOT_PASSWORD: ${pw}\n`
        : database === "mongodb"
          ? `    environment:\n      MONGO_INITDB_DATABASE: ${yamlValue(name)}\n      MONGO_INITDB_ROOT_USERNAME: ${yamlValue(user)}\n      MONGO_INITDB_ROOT_PASSWORD: ${pw}\n`
          : `    command: ["redis-server", "--appendonly", "yes", "--requirepass", ${pw}]\n`;
  const output = `services:\n  ${database}:\n    image: ${config.image}:${safeVersion}\n    restart: unless-stopped\n    ports:\n      - "127.0.0.1:${safePort}:${config.port}"\n${environment}    volumes:\n      - database_data:${config.volume}\n\nvolumes:\n  database_data:\n`;
  const changeDatabase = (value: Database) => {
    setDatabase(value);
    setVersion(databases[value].version);
    setPort(String(databases[value].port));
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopyState("Copied");
    } catch {
      setCopyState("Select the YAML to copy it manually.");
    }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([output], { type: "text/yaml" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "compose.yaml";
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="tool-panel">
      <div className="tool-heading">
        <p className="eyebrow">02 / LOCAL INFRASTRUCTURE</p>
        <h2>Docker Compose generator</h2>
        <p>
          A working starting point for a local database. Choose your settings,
          then copy or download.
        </p>
      </div>
      <div className="tool-two-columns">
        <div>
          <div className="field-grid">
            <div className="field">
              <label htmlFor="docker-type">Database</label>
              <select
                id="docker-type"
                value={database}
                onChange={(event) =>
                  changeDatabase(event.target.value as Database)
                }
              >
                {Object.entries(databases).map(([value, item]) => (
                  <option key={value} value={value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="docker-version">Image version</label>
              <input
                id="docker-version"
                value={version}
                maxLength={32}
                pattern="[a-zA-Z0-9._-]+"
                onChange={(event) => setVersion(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="docker-port">Host port</label>
              <input
                id="docker-port"
                type="number"
                min={1}
                max={65535}
                value={port}
                onChange={(event) => setPort(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="docker-name">Database name</label>
              <input
                id="docker-name"
                value={name}
                maxLength={64}
                disabled={database === "redis"}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="docker-user">Username</label>
              <input
                id="docker-user"
                value={user}
                maxLength={64}
                disabled={database === "redis"}
                onChange={(event) => setUser(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="docker-password">Password (optional)</label>
              <input
                id="docker-password"
                type="password"
                value={password}
                maxLength={128}
                autoComplete="off"
                placeholder="Use .env variable"
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          </div>
          <p className="tool-footnote">
            Leave password empty to use DATABASE_PASSWORD from a local .env
            file. Connections bind to localhost. For local development.
          </p>
        </div>
        <div>
          <div className="code-toolbar">
            <span className="mono">compose.yaml</span>
            <button className="small-button" onClick={copy}>
              {copyState === "Copied" ? (
                <Check size={13} />
              ) : (
                <Copy size={13} />
              )}
              Copy
            </button>
            <button className="small-button" onClick={download}>
              <Download size={13} />
              Download
            </button>
          </div>
          <pre className="code-output">
            <code>{output}</code>
          </pre>
          <p className="tool-footnote" role="status">
            {copyState || "Start with: docker compose up -d"}
          </p>
        </div>
      </div>
    </div>
  );
}
