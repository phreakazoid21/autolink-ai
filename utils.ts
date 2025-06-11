import { LLMSettings } from "settings";


export async function getKeywordsFromLLM(text: string, settings: LLMSettings): Promise<string[]> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${settings.openaiApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: settings.llmModel,
      messages: [{
        role: "user", content: `List 5–10 unique, meaningful 2–3 word phrases from this Obsidian note. Include people, places, events, key ideas, acronyms, or jargon. Exclude headings, structure, or generic terms. Return a plain text list only.

Note content:
---
${text}
`     }],
      max_tokens: settings.maxOutputTokens,
    })
  });

  console.log("Response status:", response.status);
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error response body:", errorText);
    throw new Error(`Failed to fetch keywords: ${response.status} ${response.statusText}`);
  }


  const data = await response.json();
  const rawText = data.choices[0].message.content;
  return rawText
    .split('\n')
    .map((line: string) => line.trim().replace(/^\- /, ''))
    .filter(Boolean);
}

export async function listLLMModels(settings: LLMSettings): Promise<string[]> {
  if (settings.cachedModels && settings.cachedModels.length > 0) {
    console.log("Using cached models:", settings.cachedModels);
    return settings.cachedModels;
  }

  if (!settings.openaiApiKey) {
    console.warn("No OpenAI API key provided, using default models");
    return ['gpt-3.5-turbo', 'gpt-4'];
  }

  const response = await fetch("https://api.openai.com/v1/models", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${settings.openaiApiKey}`,
      "Content-Type": "application/json"
    }
  });
  console.log("Response status:", response.status);
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error response body:", errorText);
    throw new Error(`Failed to fetch keywords: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log("Response data:", data);

  if (data.object != "list") {
    throw new Error('Unexpected response format from OpenAI API: ' + JSON.stringify(data));
  }

  let models: OpenAIModel[] = data.data.map((item: any) => {
    if (item.object !== 'model') {
      console.warn(`Skipping non-model item: ${JSON.stringify(item)}`);
      return null;
    }
    return {
      id: item.id,
      object: item.object,
      created: item.created,
      owned_by: item.owned_by
    };
  }).filter((model: OpenAIModel | null) => model !== null);

  return models.map((model: OpenAIModel) => model.id).sort((a, b) => a.localeCompare(b));
}

type WrapResult = {
  updated: string;
  linked: number;
};

type OpenAIModel = {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

export function wrapKeywordsInNote(note: string, keywords: string[]): WrapResult {
  let updated = note;
  let linked = 0;

  for (const phrase of keywords) {
    const escaped = escapeRegExp(phrase);
    const linkRegex = new RegExp(`\\[\\[${escaped}\\]\\]`, 'gi');
    const rawRegex = new RegExp(`(?<!\\[\\[)\\b(${escaped})\\b(?!\\]\\])`, 'gi');

    if (linkRegex.test(updated)) continue;

    const result = updated.replace(rawRegex, (match) => {
      linked++;
      return `[[${match}]]`;
    });

    updated = result;
  }

  return { updated, linked };
}


function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
