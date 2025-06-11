import { App, Notice, PluginSettingTab, Setting } from 'obsidian';
import { listLLMModels } from './utils';

export interface LLMSettings {
  openaiApiKey: string;
  llmModel: string;
  cachedModels: string[];
  maxOutputTokens: number;
}

export const DEFAULT_SETTINGS: LLMSettings = {
  openaiApiKey: '',
  llmModel: 'gpt-3.5-turbo',
  cachedModels: [],
  maxOutputTokens: 100
};

export class LLMSettingTab extends PluginSettingTab {
  plugin: any;

  constructor(app: App, plugin: any) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();
    containerEl.createEl('h2', { text: 'LLM AutoLinker Settings' });

    new Setting(containerEl)
      .setName('OpenAI API Key')
      .setDesc('Paste your OpenAI API key here.')
      .addText(text => text
        .setPlaceholder('sk-...')
        .setValue(this.plugin.settings.openaiApiKey)
        .onChange(async (value) => {
          this.plugin.settings.openaiApiKey = value;
          await this.plugin.saveSettings();
        }));

      new Setting(containerEl)
      .setName('LLM Model')
      .setDesc('Choose which LLM model to use for keyword extraction.')
      .addDropdown(async drop => {
        let models: string[];
        if (!this.plugin.settings.openaiApiKey) {
          models = ['gpt-3.5-turbo', 'gpt-4'];
        }
        else {
          try {
            models = await listLLMModels(this.plugin.settings);
          } catch (err) {
            console.error("Failed to fetch models:", err);
            models = ['gpt-3.5-turbo', 'gpt-4'];
          }
        }
        if (models.length === 0) {
          console.warn("No models found, using default gpt-3.5-turbo");
          models = ['gpt-3.5-turbo', 'gpt-4'];
        }
        this.plugin.settings.cachedModels = models; // Cache the models for future use
        console.log("Available models:", models);
        models.forEach(model => drop.addOption(model, model));
        drop.setValue(this.plugin.settings.llmModel);
        drop.onChange(async (value) => {
          this.plugin.settings.llmModel = value;
          await this.plugin.saveSettings();
        });
      });

      new Setting(containerEl)
      .setName('Max Tokens')
      .setDesc('Max number of output tokens for the LLM.')
      .addText(text => text
        .setPlaceholder('100')
        .setValue(this.plugin.settings.maxOutputTokens.toString())
        .onChange(async (value) => {
          const num = parseInt(value);
          if (isNaN(num) || num <= 0) {
            console.warn("Invalid max output tokens:", value);
            new Notice('Please enter a valid positive number');
            return;
          }
          this.plugin.settings.maxOutputTokens = num
          await this.plugin.saveSettings();
        }));
  }
}
