export type DatasetId = "all" | "ngsl" | "tsl" | "nawl";

export type DatasetConfig = {
  id: Exclude<DatasetId, "all">;
  label: string;
  path: string;
};

export type WordEntry = {
  datasetId: Exclude<DatasetId, "all">;
  datasetLabel: string;
  entry: string;
  meaningJa: string;
  exampleSentence?: string;
  translatedSentence?: string;
  pos?: string;
  wordId?: string;
};

export type QuizChoice = {
  key: string;
  meaningJa: string;
  isCorrect: boolean;
};

export type QuizQuestion = {
  word: WordEntry;
  choices: QuizChoice[];
};

export type WrongAnswer = {
  word: WordEntry;
  selectedMeaningJa: string;
};

export type LoadedDataset = {
  id: Exclude<DatasetId, "all">;
  label: string;
  words: WordEntry[];
};
