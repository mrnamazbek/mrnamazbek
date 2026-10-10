import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import {
  getMonthlyFeature,
  getFeatureHistory,
  getAudience,
  getRankings,
} from "@/lib/content";
import { PageHeading, SectionHeading } from "@/components/ui/page-heading";
import { DeveloperTools } from "@/components/lab/developer-tools";
import { MonthlyExperiment, SystemConsole } from "@/components/lab/experiments";
import { TechRadar } from "@/components/lab/tech-radar";
import { LiveSignals } from "@/components/lab/live-signals";
import { EngineeringResources } from "@/components/lab/engineering-resources";

export const metadata: Metadata = {
  title: "Lab",
  description:
    "Interactive tools and experiments: regex, Docker Compose, capacity planning, world clocks, and a data pipeline builder.",
};
export const revalidate = 300;
export default async function LabPage() {
  const [monthlyFeature, featureHistory, audience, rankings] =
    await Promise.all([
      getMonthlyFeature(),
      getFeatureHistory(),
      getAudience(),
      getRankings(),
    ]);
  const latest = audience.series.map((series) => ({
    ...series,
    latest: series.points.at(-1),
  }));
  const maxViews = Math.max(
    1,
    ...latest.map((series) => series.latest?.views ?? 0),
  );
  return (
    <>
      <PageHeading
        eyebrow="04 / PLAY, TEST, REPEAT"
        title="A little lab for big ideas."
      >
        <p>
          Useful tools, open-source signals, and experiments from the original
          site — rebuilt as a place to keep exploring.
        </p>
      </PageHeading>
      <DeveloperTools />
      <TechRadar />
      <LiveSignals />
      <section className="content-section" id="experiments">
        <SectionHeading number="08" title="The experiment archive">
          <span className="mono muted">SAVED MONTHLY FEATURES</span>
        </SectionHeading>
        <MonthlyExperiment feature={monthlyFeature} />
        <details className="feature-archive">
          <summary>
            Explore earlier experiments{" "}
            <span>{featureHistory.length} saved entries +</span>
          </summary>
          <div className="experiment-grid">
            {featureHistory
              .filter((feature) => feature.id !== monthlyFeature.id)
              .map((feature) => (
                <MonthlyExperiment feature={feature} key={feature.id} />
              ))}
          </div>
        </details>
      </section>
      <section className="content-section" id="signals">
        <SectionHeading number="09" title="Following the signals" />
        <div className="signals-grid">
          <article className="signal-panel">
            <p className="eyebrow">AI AUDIENCE SNAPSHOT / {audience.as_of}</p>
            <h3>Attention, by the article.</h3>
            <p>{audience.methodology}</p>
            <div className="audience-bars">
              {latest.map((series) => (
                <div key={series.id}>
                  <div>
                    <strong>{series.label}</strong>
                    <span className="mono">
                      {series.latest?.views.toLocaleString() ?? "—"} views
                    </span>
                  </div>
                  <i>
                    <span
                      style={{
                        width: `${((series.latest?.views ?? 0) / maxViews) * 100}%`,
                      }}
                    />
                  </i>
                </div>
              ))}
            </div>
            <p className="tool-footnote">
              Last saved weekly pageviews, not active users. Generated{" "}
              {audience.generated_at.slice(0, 10)} by {audience.source.name}.
            </p>
            <a
              href={audience.source.docs[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
            >
              About the source <ArrowUpRight size={15} />
            </a>
          </article>
          <article className="signal-panel">
            <p className="eyebrow">
              DATABASE POPULARITY / {rankings[0]?.as_of}
            </p>
            <h3>The database landscape.</h3>
            <p>
              A saved view of DB-Engines rankings. Popularity describes the
              ecosystem, not fitness for a project.
            </p>
            <div className="ranking-table-wrapper">
              <table className="ranking-table">
                <caption className="sr-only">
                  Saved DB-Engines database popularity rankings
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Rank / Database</th>
                    <th scope="col">Score</th>
                    <th scope="col">Monthly change</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.slice(0, 10).map((database) => (
                    <tr key={database.name}>
                      <th scope="row">
                        <span className="mono">
                          {String(database.rank).padStart(2, "0")}
                        </span>
                        {database.name}
                      </th>
                      <td>{database.score_current.toFixed(1)}</td>
                      <td
                        className={database.delta_mom >= 0 ? "accent" : "muted"}
                      >
                        {database.delta_mom > 0 ? "+" : ""}
                        {database.delta_mom.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <a
              href={rankings[0]?.source ?? "https://db-engines.com/en/ranking"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
            >
              View current rankings <ArrowUpRight size={15} />
            </a>
          </article>
        </div>
      </section>
      <SystemConsole />
      <EngineeringResources />
    </>
  );
}
