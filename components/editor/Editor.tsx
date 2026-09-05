"use client";

import { useEffect, useState } from "react";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import "./editor.css";
import type { Block, PartialBlock } from "@blocknote/core";

interface EditorProps {
  /** Existing document to open the editor with. Omit/empty for a blank document. */
  initialContent?: PartialBlock[];
  /** Called with the full document whenever the user edits it. */
  onChange?: (blocks: Block[]) => void;
  /** Set to `false` to render a read-only view instead of an editable one. */
  editable?: boolean;
}

/**
 * Reads whether the app is currently in dark mode (a `dark` class toggled on
 * `<html>` outside of React, see `components/theme-toggle.tsx`) and keeps
 * watching for changes, so the BlockNote editor's own theme stays in sync.
 */
function useAppTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
      ? "dark"
      : "light"
  );

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setTheme(root.classList.contains("dark") ? "dark" : "light");
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return theme;
}

/**
 * The actual BlockNote editor instance. Client-only (depends on the browser),
 * so it must always be loaded through `DynamicEditor`, never imported directly
 * into a component that might render on the server.
 */
export default function Editor({ initialContent, onChange, editable = true }: EditorProps) {
  const theme = useAppTheme();
  const editor = useCreateBlockNote({
    initialContent: initialContent?.length ? initialContent : undefined,
  });

  return (
    <BlockNoteView
      editor={editor}
      editable={editable}
      theme={theme}
      onChange={() => onChange?.(editor.document)}
    />
  );
}
