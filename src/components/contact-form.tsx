"use client";

import { useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, LoaderCircle } from "lucide-react";

export function ContactForm({ email }: { email: string }) {
  const [status, setStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "pending") return;
    const data = new FormData(event.currentTarget);
    setStatus("pending");
    setMessage("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
          website: data.get("website") ?? "",
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok)
        throw new Error(
          result.error ||
            "Your message couldn’t be saved. Please try email instead.",
        );
      setStatus("success");
      setMessage("Your message was saved. Thank you for reaching out.");
      formRef.current?.reset();
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Your message couldn’t be saved. Please try email instead.",
      );
    }
  }
  return (
    <form className="contact-form" onSubmit={submit} ref={formRef}>
      <div className="field-grid">
        <div className="field">
          <label htmlFor="contact-name">Your name</label>
          <input
            id="contact-name"
            name="name"
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            placeholder="How should I call you?"
          />
        </div>
        <div className="field">
          <label htmlFor="contact-email">Email address</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor="contact-message">What do you have in mind?</label>
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          placeholder="A project, an idea, or simply a hello…"
        />
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <div className="form-footer">
        <button
          className="button button-primary"
          type="submit"
          disabled={status === "pending"}
        >
          {status === "pending" ? (
            <>
              Saving <LoaderCircle size={17} className="spin" />
            </>
          ) : status === "success" ? (
            <>
              Message saved <Check size={17} />
            </>
          ) : (
            <>
              Send a message <ArrowUpRight size={17} />
            </>
          )}
        </button>
        <span>Your details are only used to reply.</span>
      </div>
      <div
        role="status"
        aria-live="polite"
        className={`form-status ${status === "error" ? "error-text" : ""}`}
      >
        {message}
        {status === "error" && (
          <>
            {" "}
            <a href={`mailto:${email}`}>Email me directly ↗</a>
          </>
        )}
      </div>
    </form>
  );
}
