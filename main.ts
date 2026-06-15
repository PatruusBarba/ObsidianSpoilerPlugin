import { Editor, MarkdownView, Notice, Plugin } from "obsidian";

/** Matches the header line of a spoiler callout, e.g. `> [!spoiler]- title`. */
const SPOILER_HEADER = /^>\s*\[!spoiler\]-?/i;
/** Matches the header line once the leading callout marker (`> `) is stripped. */
const SPOILER_HEADER_STRIPPED = /^\[!spoiler\]-?/i;
/** Matches a fenced code block delimiter (``` optionally followed by a language). */
const CODE_FENCE = /^```/;

/**
 * Returns true when the given selection already is a spoiler callout, i.e. its
 * first non-empty line is a `> [!spoiler]` header.
 */
export function isSpoiler(text: string): boolean {
	const firstLine = text.split("\n").find((line) => line.trim() !== "");
	return firstLine !== undefined && SPOILER_HEADER.test(firstLine);
}

/**
 * Wraps arbitrary text in a collapsible spoiler callout containing a fenced
 * code block:
 *
 * ```
 * > [!spoiler]-
 * >```
 * >selected text
 * >```
 * ```
 */
export function wrapSpoiler(text: string): string {
	const body = text.split("\n").map((line) => ">" + line).join("\n");
	return ["> [!spoiler]-", ">```", body, ">```"].join("\n");
}

/**
 * Reverses {@link wrapSpoiler}: strips the callout markers, drops the
 * `[!spoiler]` header and the surrounding code fence, and returns the inner
 * content. Falls back to simply removing the callout markers if the body is not
 * a fenced code block.
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
	let body = lines.slice(start);

	// If the body is wrapped in a fenced code block, strip the fences.
	const first = body.findIndex((line) => line.trim() !== "");
	let last = -1;
	for (let i = body.length - 1; i >= 0; i--) {
		if (body[i].trim() !== "") {
			last = i;
			break;
		}
	}
	if (
		first !== -1 &&
		last > first &&
		CODE_FENCE.test(body[first].trim()) &&
		CODE_FENCE.test(body[last].trim())
	) {
		body = body.slice(first + 1, last);
	}

	return body.join("\n");
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
