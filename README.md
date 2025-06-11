# 🔗 LLM AutoLinker

**LLM AutoLinker** is a plugin that uses a Large Language Model (LLM) to automatically identify and wrap thematically relevant phrases, people, and concepts in `[[wikilinks]]` — helping you build a smarter, more connected knowledge graph with zero manual effort.

---

## ✨ Features

- Automatically identifies:
  - Notable people
  - Thematic keywords
  - Places, dates, events, acronyms
- Wraps unlinked terms in `[[wikilinks]]`
- Skips YAML frontmatter and existing links
- Works on-demand via:
  - Status bar button
  - Command palette
  - Customizable hotkey (default: `Cmd/Ctrl + L`)
- Supports multiple LLM models (OpenAI GPT-4, GPT-3.5, GPT-4o, etc.)
- Caches model list to avoid repeated network calls
- Configurable maximum keyword count

---

## 🧠 Why Use It?

Backlinks are great, but a pain to do manually. LLM AutoLinker does it *for you*, by understanding the content and linking only meaningful, specific terms.

It’s like Zettelkasten meets AI.

---

## ⚙️ Settings

| Setting           | Description                                     |
|-------------------|-------------------------------------------------|
| `API Key`         | Your OpenAI API key                            |
| `LLM Model`       | Model to use (e.g. `gpt-4`, `gpt-3.5-turbo`)    |
| `Max Keywords`    | Limit how many terms to extract per note       |
| `Refresh Models`  | Clear cached model list and reload it manually |

---

## 🚀 Installation (Manual)

1. Clone or download this repository.
2. Copy the contents into your vault’s plugin directory:  
   `YOUR_VAULT/.obsidian/plugins/llm-autolinker`
3. Run:
   ```bash
   npm install
   npm run build

---

## 🧪 Usage

* Open any note.
* Click the 🔗 icon in the status bar — or use `Cmd/Ctrl + L`.
* That’s it. Your note now contains relevant `[[wikilinks]]`.

---

## 🛡️ Privacy

This plugin sends note content to your selected LLM provider (e.g., OpenAI) **only for keyword extraction**. No content is logged or stored by the plugin.

---

## 📄 License

MIT

---

## 🙏 Acknowledgements

Built with ❤️ by [Alex B](https://github.com/phreakazoid21)
