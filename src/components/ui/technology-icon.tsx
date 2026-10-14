import Image from "next/image";
import styles from "./technology-icon.module.css";

/** Curated Dashboard Icons assets; visible tool names remain the accessible labels. */
const sources: Partial<Record<string, string>> = {
  airflow: "apache-airflow",
  "apache airflow": "apache-airflow",
  iceberg: "apache-iceberg",
  "apache iceberg": "apache-iceberg",
  kafka: "kafka",
  "apache kafka": "kafka",
  python: "python",
  go: "golang",
  golang: "golang",
  postgres: "postgresql",
  postgresql: "postgresql",
  mysql: "mysql",
  docker: "docker",
  git: "git",
  tensorflow: "tensorflow",
  pytorch: "pytorch",
  datagrip: "datagrip",
};

export function TechnologyIcon({ tool }: { tool: string }) {
  const source = sources[tool.trim().toLowerCase()];
  if (!source) return null;

  return (
    <span className={styles.badge} aria-hidden="true">
      <Image
        src={`/assets/technology-icons/${source}.svg`}
        width={20}
        height={20}
        alt=""
        className={styles.image}
        draggable={false}
        unoptimized
      />
    </span>
  );
}
