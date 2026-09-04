"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const THEME_CHANGE_EVENT = "themechange";

/** Reads the live source of truth: the `.dark` class on `<html>`, which the
 *  anti-flash inline script (see app/layout.tsx) already set before paint. */
function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

/** Matches the server-rendered default (no `.dark` class) so hydration agrees. */
function getServerSnapshot() {
  return false;
}

/** No native "class changed" event exists, so `toggle()` dispatches one manually
 *  after mutating the DOM — this is how useSyncExternalStore learns to re-read
 *  the snapshot and re-render, without ever calling setState from an effect. */
function subscribe(onStoreChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
}

/**
 * ThemeToggle switches the app between light and dark mode by toggling the
 * `.dark` class on `<html>` and persisting the choice to localStorage.
 */
export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // Ignore — theme just won't persist across visits.
    }
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
