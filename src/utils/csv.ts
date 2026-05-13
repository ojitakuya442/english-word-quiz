import Papa from "papaparse";
import type { DatasetConfig, LoadedDataset, WordEntry } from "../types";

type CsvRow = {
  entry?: string;
  meaning_ja?: string;
  example_sentence?: string;
  translated_sentence?: string;
  pos?: string;
  word_id?: string;
};

const trimValue = (value: string | undefined): string => value?.trim() ?? "";

const makeCsvUrl = (path: string): string => {
  const base = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${base}${path.replace(/^\//, "")}`;
};

export const loadDataset = async (
  dataset: DatasetConfig
): Promise<LoadedDataset> => {
  const response = await fetch(makeCsvUrl(dataset.path));

  if (!response.ok) {
    throw new Error(`${dataset.label} のCSV読み込みに失敗しました。`);
  }

  const csvText = await response.text();
  if (!csvText.trim()) {
    throw new Error(`${dataset.label} のCSVが空です。`);
  }

  const parsed = Papa.parse<CsvRow>(csvText, {
    header: true,
    skipEmptyLines: true
  });

  if (parsed.errors.length > 0) {
    const firstError = parsed.errors[0];
    throw new Error(
      `${dataset.label} のCSV解析に失敗しました: ${firstError.message}`
    );
  }

  const fields = parsed.meta.fields ?? [];
  if (!fields.includes("entry")) {
    throw new Error(`${dataset.label} に entry 列がありません。`);
  }
  if (!fields.includes("meaning_ja")) {
    throw new Error(`${dataset.label} に meaning_ja 列がありません。`);
  }

  const seenEntries = new Set<string>();
  const words: WordEntry[] = [];

  for (const row of parsed.data) {
    const entry = trimValue(row.entry);
    const meaningJa = trimValue(row.meaning_ja);

    if (!entry || !meaningJa || seenEntries.has(entry.toLowerCase())) {
      continue;
    }

    seenEntries.add(entry.toLowerCase());
    words.push({
      datasetId: dataset.id,
      datasetLabel: dataset.label,
      entry,
      meaningJa,
      exampleSentence: trimValue(row.example_sentence) || undefined,
      translatedSentence: trimValue(row.translated_sentence) || undefined,
      pos: trimValue(row.pos) || undefined,
      wordId: trimValue(row.word_id) || undefined
    });
  }

  if (words.length === 0) {
    throw new Error(`${dataset.label} に有効な単語がありません。`);
  }

  return {
    id: dataset.id,
    label: dataset.label,
    words
  };
};

export const loadDatasets = async (
  datasets: DatasetConfig[]
): Promise<LoadedDataset[]> => Promise.all(datasets.map(loadDataset));
