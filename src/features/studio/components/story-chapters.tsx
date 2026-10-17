"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  useStudioSignals,
  useStudioChapterNavigation,
  studioMotionQuery,
} from "../runtime/studio-runtime";
import { setSceneProgress } from "../runtime/signals";
import { studioHeading } from "../content/story";
import { ventures } from "../content/ventures";
import { CapabilityMatrix } from "./capability-matrix";
import { ConnectTerminal } from "./connect-terminal";
import { KineticHeading } from "../motion/kinetic-heading";
import { MagneticAction } from "../motion/magnetic-action";
import { TiltCard } from "../motion/tilt-card";
import styles from "./studio.module.css";
export function StoryChapters(): React.JSX.Element {
  const signals = useStudioSignals();
  const navigation = useStudioChapterNavigation();
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const context = gsap.context(() => {
      const media = gsap.matchMedia();
      media.add(studioMotionQuery, () => {
        const trigger = ScrollTrigger.create({
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            signals.progress = self.progress;
            signals.chapter = Math.min(3, Math.floor(self.progress * 4));
            window.dispatchEvent(new Event("studio:invalidate"));
          },
        });
        const resize = new ResizeObserver(() => trigger.refresh());
        if (root.current) resize.observe(root.current);
        return () => {
          resize.disconnect();
          trigger.kill();
        };
      });
    }, root);
    ScrollTrigger.refresh();
    // Next can commit its hash scroll before this client story has mounted.
    // Only an explicit Studio chapter navigation gets this one-shot fallback.
    const chapter = navigation.take();
    if (chapter)
      document.getElementById(chapter)?.scrollIntoView({
        block: "start",
        behavior: "instant",
      });
    window.dispatchEvent(new Event("studio:story-ready"));
    return () => {
      navigation.cancel();
      context.revert();
      setSceneProgress(signals, 0);
    };
  }, [signals, navigation]);
  return (
    <div ref={root} data-studio-story>
      <section id="studio-author" className={styles.hero}>
        <p className={styles.eyebrow}>
          <span className={styles.dot} /> NAMAZBEK BEKZHANOV · DATA ENGINEER &
          BACKEND DEVELOPER
        </p>
        <KineticHeading text={studioHeading} as="h1" />
        <p className={styles.heroCopy}>
          I turn complex data and backend problems into systems people can
          trust. This is my working space for exploring ideas, making tradeoffs
          visible, and building what comes next.
        </p>
        <div className={styles.actions}>
          <MagneticAction>
            <a
              className={`${styles.action} ${styles.primary}`}
              href="#studio-capabilities"
            >
              Explore the lab <span aria-hidden="true">↓</span>
            </a>
          </MagneticAction>
          <MagneticAction>
            <Link className={styles.action} href="/studio/connect">
              Start a conversation <span aria-hidden="true">↗</span>
            </Link>
          </MagneticAction>
        </div>
        <div className={styles.sideNote}>
          <span>01 — PERSONAL SYSTEMS / OPEN QUESTIONS</span>
          <span>SCROLL TO UNFOLD ↓</span>
        </div>
      </section>
      <section id="studio-capabilities" className={styles.chapter}>
        <div className={styles.eyebrow}>
          02 / CAPABILITY MATRIX{" "}
          <span style={{ marginLeft: "auto" }}>
            SIX WAYS TO INSPECT THE WORK
          </span>
        </div>
        <div className={styles.sectionHead}>
          <KineticHeading text="Less promise. More proof." as="h2" />
          <p>
            Small, inspectable experiments. Real interactions, local fixtures,
            and a clear line between a prototype and a product.
          </p>
        </div>
        <CapabilityMatrix />
      </section>
      <section id="studio-architecture" className={styles.chapter}>
        <div className={styles.eyebrow}>03 / ARCHITECTURE & SCALE</div>
        <div className={styles.sectionHead}>
          <KineticHeading text="Make the invisible understandable." as="h2" />
          <p>
            Every useful system is a set of choices. I care about what happens
            between the boxes.
          </p>
        </div>
        <div className={styles.architecture}>
          <div className={styles.diagram}>
            <svg
              viewBox="0 0 600 290"
              role="img"
              aria-label="Illustrative pipeline: Source, Validate, Transform, Serve"
            >
              <defs>
                <linearGradient id="pipeline-line">
                  <stop stopColor="#99E0C0" />
                  <stop offset="1" stopColor="#BDEEFF" />
                </linearGradient>
              </defs>
              <path
                d="M75 140H525"
                stroke="url(#pipeline-line)"
                strokeWidth="2"
              />
              {["Source", "Validate", "Transform", "Serve"].map((name, i) => (
                <g key={name} transform={`translate(${75 + i * 150} 140)`}>
                  <rect
                    x="-42"
                    y="-42"
                    width="84"
                    height="84"
                    rx="15"
                    fill="#142c39"
                    stroke="#7aa9bc"
                  />
                  <path
                    d={i % 2 ? "m-12 0 8 8 17-19" : "M-13-12H13V12H-13Z"}
                    stroke="#bdeeff"
                    strokeWidth="2"
                    fill="none"
                  />
                  <text y="75" textAnchor="middle" fill="#b7d0dd" fontSize="13">
                    {name}
                  </text>
                  <text
                    y="-65"
                    textAnchor="middle"
                    fill="#6794a8"
                    fontSize="11"
                  >
                    0{i + 1}
                  </text>
                </g>
              ))}
            </svg>
            <p className={styles.caption}>
              Illustrative architecture; no jobs are running.
              <br />A fixed path, explicit boundaries, and a traceable sample
              packet.
            </p>
            <Link href="/studio/modules/architecture" className={styles.action}>
              Inspect the architecture ↗
            </Link>
          </div>
          <div>
            {[
              {
                title: "Start with the contract.",
                body: "Define the input, the grain and the boundary before choosing the tool.",
              },
              {
                title: "Design for the unhappy path.",
                body: "Invalid input, unavailable dependencies and recovery are part of the product.",
              },
              {
                title: "Make tradeoffs inspectable.",
                body: "Choose a simpler system when the complexity has not earned its place.",
              },
            ].map((p, i) => (
              <div className={styles.principle} key={p.title}>
                <span>0{i + 1}</span>
                <div>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="studio-ventures" className={styles.chapter}>
        <div className={styles.eyebrow}>04 / VENTURE LAB</div>
        <div className={styles.sectionHead}>
          <KineticHeading text="What should exist next?" as="h2" />
          <p>
            Questions I am exploring. These are hypotheses to validate with
            people, before they become products.
          </p>
        </div>
        <div className={styles.grid}>
          {ventures.map((v, i) => (
            <TiltCard key={v.title}>
              <article className={`${styles.card} ${styles.ventureCard}`}>
                <div className={styles.cardTop}>
                  <span>HYPOTHESIS 0{i + 1}</span>
                  <span className={styles.badge}>
                    <span className={styles.dot} /> {v.status}
                  </span>
                </div>
                <h3>{v.title}</h3>
                <p>{v.question}</p>
                <div className={styles.next}>
                  <small>Next validation step</small>
                  {v.nextStep}
                  <p style={{ fontSize: 11, marginTop: 16, marginBottom: 0 }}>
                    {v.boundary}
                  </p>
                </div>
              </article>
            </TiltCard>
          ))}
        </div>
        <ConnectTerminal />
        <p className={styles.caption} style={{ marginTop: 22 }}>
          Ecommerce remains an unbuilt hypothesis. No shop or pricing is offered
          here.
        </p>
      </section>
    </div>
  );
}
