"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Client-only, code-split wrapper around `Editor`. BlockNote depends on
 * browser APIs, so it must never be rendered on the server (`ssr: false`) -
 * this indirection is what lets dialogs that use it stay lightweight until
 * the editor is actually needed.
 */
export const DynamicEditor = dynamic(() => import("./Editor"), {
  ssr: false,
  loading: () => <Skeleton className="h-40 w-full" />,
});
