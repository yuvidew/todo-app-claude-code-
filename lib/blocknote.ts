import type { Block } from "@blocknote/core";

/**
 * Recursively extracts the plain, readable text from a BlockNote document.
 *
 * A task description is now a structured array of blocks rather than a
 * string, so anything that used to treat `description` as text (full-text
 * search, the truncated card preview) needs this projection instead.
 */
export function blocksToPlainText(blocks: Block[] | undefined): string {
  if (!blocks || blocks.length === 0) return "";
  return blocks.map(blockToPlainText).filter(Boolean).join("\n");
}

function blockToPlainText(block: Block): string {
  const ownText = contentToPlainText(block.content);
  const childText = block.children.length ? blocksToPlainText(block.children) : "";
  return [ownText, childText].filter(Boolean).join("\n");
}

/**
 * A block's `content` can be an array of inline text/links, a table's
 * rows/cells, "plain" text content, or `undefined` - depending on the block
 * type. Rather than special-casing every shape, this walks whatever it finds
 * (arrays, `{ text }`, `{ content }`, `{ rows }`) until it bottoms out at text.
 */
function contentToPlainText(content: unknown): string {
  if (!content) return "";

  if (Array.isArray(content)) {
    return content.map(contentToPlainText).filter(Boolean).join("");
  }

  if (typeof content === "object") {
    const node = content as Record<string, unknown>;
    if (typeof node.text === "string") return node.text;
    if (Array.isArray(node.rows)) {
      return (node.rows as { cells: unknown[] }[])
        .map((row) => row.cells.map(contentToPlainText).join(" "))
        .join("\n");
    }
    if ("content" in node) return contentToPlainText(node.content);
  }

  return "";
}

/** Whether a description has no meaningful text, for empty-state fallbacks. */
export function isDescriptionEmpty(blocks: Block[] | undefined): boolean {
  return blocksToPlainText(blocks).trim().length === 0;
}
