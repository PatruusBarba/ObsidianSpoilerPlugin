import { Editor, MarkdownView, Notice, Plugin } from "obsidian";

/** Matches the header line of a spoiler callout, e.g. `> [!spoiler]- title`. */
const SPOILER_HEADER = /^>\s*\[!spoiler\]-?/i;
/** Matches the header line once the leading callout marker (`> `) is stripped. */
const SPOILER_HEADER_STRIPPED = /^\[!spoiler\]-?/i;

/**
 * Returns true when the given selection already is a spoiler callout, i.e. its
 * first non-empty line is a `> [!spoiler]` header.
 */
export function isSpoiler(text: string): boolean {
	const firstLine = text.split("\n").find((line) => line.trim() !== "");
	return firstLine !== undefined && SPOILER_HEADER.test(firstLine);
}

/**
 * Wraps arbitrary text in a collapsible spoiler callout. Each line of the
 * selection becomes a callout continuation line, so the markdown inside the
 * spoiler is preserved:
 *
 * ```
 * > [!spoiler]-
 * > selected text
 * ```
 */
export function wrapSpoiler(text: string): string {
	const body = text
		.split("\n")
		.map((line) => (line === "" ? ">" : "> " + line))
		.join("\n");
	return "> [!spoiler]-\n" + body;
}

/**
 * Reverses {@link wrapSpoiler}: removes the callout marker (`> `) from every
 * line and drops the `[!spoiler]` header, returning the inner content exactly
 * as it was before wrapping. The content itself is never altered, so a
 * selection that contains code fences (```) round-trips unchanged.
 */
export function unwrapSpoiler(text: string): string {
	// Remove the callout marker (`> ` or `>`) from every line.
	const lines = text.split("\n").map((line) => line.replace(/^> ?/, ""));

	// Drop the `[!spoiler]` header line (and anything before it).
	let start = 0;
	for (let i = 0; i < lines.length; i++) {
		if (SPOILER_HEADER_STRIPPED.test(lines[i].trim())) {
			start = i + 1;
			break;
		}
	}

	return lines.slice(start).join("\n");
}

export default class SpoilerPlugin extends Plugin {
	async onload() {
		this.addRibbonIcon("eye-off", "Toggle spoiler on selection", () => {
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (!view) {
				new Notice("Open a note to toggle a spoiler.");
				return;
			}
			this.toggleSpoiler(view.editor);
		});

		this.addCommand({
			id: "toggle-spoiler",
			name: "Toggle spoiler on selection",
			editorCallback: (editor) => this.toggleSpoiler(editor),
		});
	}

	private toggleSpoiler(editor: Editor): void {
		const selection = editor.getSelection();
		if (selection.length === 0) {
			new Notice("Select some text to toggle a spoiler.");
			return;
		}
		const replacement = isSpoiler(selection)
			? unwrapSpoiler(selection)
			: wrapSpoiler(selection);
		editor.replaceSelection(replacement);
	}
}
