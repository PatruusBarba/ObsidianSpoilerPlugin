# Obsidian Spoiler Plugin

An [Obsidian](https://obsidian.md) plugin that lets you hide and reveal sensitive
text in your notes with a single click. Select some text, press the ribbon
button, and the selection is wrapped in a collapsible **spoiler** callout. Press
it again on a spoiler and it gets unwrapped back to plain text.

## Features

- Adds a button to the left ribbon (near *Open daily note*).
- Wraps the currently selected text in a collapsible spoiler callout.
- Toggling: if the selection already is a spoiler, it is unwrapped back to plain
  text.

## Spoiler format

The plugin wraps your selection in a collapsible callout with a fenced code
block, so the content stays hidden until you expand it:

```markdown
> [!spoiler]- crypto key
>```
>super_secret_key
>```
```

In reading view this renders as a collapsed callout titled *crypto key*; click it
to reveal the hidden contents.

## Usage

1. Open a note and select the text you want to hide.
2. Click the spoiler button in the left ribbon.
3. The selected text is replaced with a spoiler callout.
4. To reveal it permanently, select the spoiler and click the button again to
   unwrap it.

## Installation

### Manual

1. Build the plugin (see below) or download a release.
2. Copy `main.js`, `manifest.json`, and `styles.css` (if present) into your
   vault at `<vault>/.obsidian/plugins/obsidian-spoiler-plugin/`.
3. Reload Obsidian and enable **Spoiler Plugin** in *Settings → Community
   plugins*.

### Building from source

```bash
npm install
npm run build
```

## License

MIT
