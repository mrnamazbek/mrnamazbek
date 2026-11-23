"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { LocalDialog } from "@/features/studio/components/local-dialog";
import { engineeringWork } from "./work";
import { WorkVisual } from "./work-visual";
import styles from "./engineering.module.css";

const chapterDuration = 4700;

function cue(audio: AudioContext, chapter: number) {
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  const now = audio.currentTime;
  oscillator.frequency.setValueAtTime(180 + chapter * 65, now);
  oscillator.frequency.exponentialRampToValueAtTime(105 + chapter * 40, now + 0.26);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.065, now + 0.035);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
  oscillator.connect(gain).connect(audio.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.34);
  oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
}

function Reel({ onClose }: { onClose: () => void }) {
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(() => !matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [muted, setMuted] = useState(true);
  const [complete, setComplete] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const timing = useRef({ frame: 0, remaining: chapterDuration });
  const work = engineeringWork[frame];

  useEffect(() => {
    if (timing.current.frame !== frame) timing.current = { frame, remaining: chapterDuration };
    if (!playing) return;
    const chapter = timing.current;
    const started = performance.now();
    let finished = false;
    const pauseIfHidden = () => { if (document.hidden) setPlaying(false); };
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const pauseIfReduced = () => { if (motion.matches) setPlaying(false); };
    document.addEventListener("visibilitychange", pauseIfHidden);
    motion.addEventListener("change", pauseIfReduced);
    const timer = window.setTimeout(() => {
      finished = true;
      chapter.remaining = chapterDuration;
      if (frame === engineeringWork.length - 1) {
        setComplete(true);
        setPlaying(false);
      } else {
        setFrame(frame + 1);
      }
    }, chapter.remaining);
    return () => {
      window.clearTimeout(timer);
      if (!finished) chapter.remaining = Math.max(0, chapter.remaining - (performance.now() - started));
      document.removeEventListener("visibilitychange", pauseIfHidden);
      motion.removeEventListener("change", pauseIfReduced);
    };
  }, [frame, playing]);

  useEffect(() => {
    if (!muted && audio.current?.state === "running") cue(audio.current, frame);
  }, [frame, muted]);

  useEffect(() => () => { void audio.current?.close().catch(() => {}); }, []);

  async function toggleSound() {
    if (!muted) {
      setMuted(true);
      await audio.current?.suspend().catch(() => {});
      return;
    }
    if (typeof AudioContext === "undefined") return;
    try {
      const context = audio.current ?? new AudioContext();
      audio.current = context;
      await context.resume();
      if (context.state === "running") setMuted(false);
    } catch {
      setMuted(true);
    }
  }

  return (
    <LocalDialog title="Engineering reel" onClose={onClose} className={styles.reelDialog} closeLabel="Close reel" closeOnBackdrop>
      <div className={styles.reelFrame} data-playing={playing}>
        <WorkVisual key={work.slug} work={work} />
        <div className={styles.reelCopy}>
          <p className={styles.discipline}>{work.discipline}</p>
          <h4>{work.title}</h4>
          <ul className={styles.stack} aria-label="Technology stack">
            {work.stack.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </div>
      <div className={styles.reelControls}>
        <div className={styles.reelSegments} role="group" aria-label="Reel chapters">
          {engineeringWork.map((item, index) => (
            <button type="button" key={item.slug} aria-label={item.discipline} aria-pressed={frame === index} onClick={() => {
              setFrame(index);
              setComplete(false);
              setPlaying(false);
            }}>{String(index + 1).padStart(2, "0")}</button>
          ))}
        </div>
        <button className={styles.control} type="button" onClick={() => {
          if (complete) { setFrame(0); setComplete(false); }
          setPlaying(!playing);
        }}>
          {playing ? <Pause size={16} /> : complete ? <RotateCcw size={16} /> : <Play size={16} />}
          {playing ? "Pause" : complete ? "Replay" : "Play"}
        </button>
        <button className={styles.control} type="button" aria-label="Reel sound" aria-pressed={!muted} onClick={() => void toggleSound()}>
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />} {muted ? "Sound off" : "Sound on"}
        </button>
        <Link className="text-link" href={`/projects/${work.slug}`} onFocus={() => setPlaying(false)} onNavigate={onClose}>Read case study <ArrowUpRight size={16} aria-hidden="true" /></Link>
      </div>
    </LocalDialog>
  );
}

export function ReelTrigger() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <a href="#selected-work" className={styles.reelTrigger} aria-haspopup="dialog" onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        event.currentTarget.focus({ preventScroll: true });
        setOpen(true);
      }}>
        <Play size={16} aria-hidden="true" />
        <span><strong>Engineering reel</strong><small>Three projects · 14 sec</small></span>
      </a>
      {open && <Reel onClose={() => setOpen(false)} />}
    </>
  );
}
