"use client";

import { useState, type FormEvent } from "react";
import { LuSend } from "react-icons/lu";
import { profile } from "@/data/profile";
import { Magnetic } from "@/components/ui/Magnetic";

const topics = ["New system or SaaS", "Website", "Fix or extend an existing system", "Hosting & maintenance", "Full-time role", "Something else"];

type Errors = Partial<Record<"name" | "email" | "message", string>>;

const field =
  "mt-2 w-full rounded-xl border border-line bg-bg-2/70 px-4 py-3 text-ink placeholder:text-ink-2/60 outline-none transition-colors focus:border-accent";

/**
 * Frontend-only for now: builds a pre-filled email in the visitor's mail app.
 * Swap handleSubmit for an API call when the backend exists.
 */
export function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const topic = String(data.get("topic") ?? "");
    const message = String(data.get("message") ?? "").trim();

    const next: Errors = {};
    if (!name) next.name = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter an email address like name@example.com.";
    if (message.length < 10) next.message = "Add a few more details (at least 10 characters).";
    setErrors(next);
    if (Object.keys(next).length) return;

    const subject = `${topic} — from ${name}`;
    const body = `${message}\n\n— ${name}\n${email}`;
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const errorText = (key: keyof Errors) =>
    errors[key] && (
      <p id={`${key}-error`} className="mt-1.5 text-sm text-accent">
        {errors[key]}
      </p>
    );

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-3xl border border-line bg-bg-2/60 p-6 backdrop-blur sm:p-10">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium text-ink">
          Name
          <input name="name" autoComplete="name" placeholder="Your name" className={field} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} />
          {errorText("name")}
        </label>
        <label className="block text-sm font-medium text-ink">
          Email
          <input name="email" type="email" autoComplete="email" placeholder="you@company.com" className={field} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} />
          {errorText("email")}
        </label>
      </div>
      <label className="mt-5 block text-sm font-medium text-ink">
        What is it about?
        <select name="topic" className={field} defaultValue={topics[0]}>
          {topics.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className="mt-5 block text-sm font-medium text-ink">
        Message
        <textarea
          name="message"
          rows={6}
          placeholder="What are you building, who uses it, and when do you need it?"
          className={`${field} resize-y`}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
          data-lenis-prevent
        />
        {errorText("message")}
      </label>
      <div className="mt-8 flex flex-wrap items-center gap-5">
        <Magnetic>
          <button type="submit" className="flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 font-medium text-white shadow-[0_10px_30px_var(--glow)] transition-transform hover:scale-[1.03]">
            Open email draft <LuSend size={16} aria-hidden />
          </button>
        </Magnetic>
        <p className="text-sm text-ink-2" aria-live="polite">
          {sent ? "Your email app should now be open with the message filled in. Press send there." : "Opens your email app with this message filled in."}
        </p>
      </div>
    </form>
  );
}
