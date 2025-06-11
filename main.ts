import { Plugin, Notice } from 'obsidian';
import { getKeywordsFromLLM, wrapKeywordsInNote } from './utils';
import { LLMSettingTab, DEFAULT_SETTINGS, LLMSettings } from './settings';

export default class AutolinkAI extends Plugin {
  settings!: LLMSettings;

  async onload() {
    await this.loadSettings();

    // ✅ Status bar item defined at plugin load time
    const statusBarItem = this.addStatusBarItem();
    statusBarItem.setText('🔗 AutoLink');
    statusBarItem.setAttr('title', 'Click to auto-link keywords using LLM');

    statusBarItem.addEventListener('click', async () => {
      await this.runAutoLink();
    });

    // 🔁 Original command remains
    this.addCommand({
      id: 'autolink-ai',
      name: 'Auto-Link Keywords with LLM',
      callback: async () => {
        await this.runAutoLink();
      }
    });

    this.addSettingTab(new LLMSettingTab(this.app, this));
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async runAutoLink() {
    new Notice('🔄 Running AutoLink…');

    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      new Notice('⚠️ No active note open');
      return;
    }

    const content = await this.app.vault.read(activeFile);

    let keywords: string[] = [];
    try {
      keywords = await getKeywordsFromLLM(content, this.settings);
    } catch (err) {
      new Notice('❌ LLM failed. Check API key or console.');
      return;
    }


    if (keywords.length === 0) {
      new Notice('⚠️ No keywords found');
      return;
    }

    const { updated, linked } = wrapKeywordsInNote(content, keywords);

    if (linked === 0) {
      new Notice('✅ No new keywords linked');
      return;
    }

    await this.app.vault.modify(activeFile, updated);
    new Notice(`✅ Linked ${linked} new keyword(s)`);
  }
}