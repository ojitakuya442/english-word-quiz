import type { QuizChoice, QuizQuestion, WordEntry } from "../types";

const CHOICE_KEYS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export type QuizBuildResult = {
  questions: QuizQuestion[];
  adjustedQuestionCount: number;
  notice?: string;
};

const shuffle = <T>(items: T[]): T[] => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
};

const uniqueMeaningCount = (words: WordEntry[]): number =>
  new Set(words.map((word) => word.meaningJa)).size;

const uniqueWordsByEntry = (words: WordEntry[]): WordEntry[] => {
  const seenEntries = new Set<string>();
  const result: WordEntry[] = [];

  for (const word of words) {
    const key = word.entry.toLowerCase();
    if (seenEntries.has(key)) {
      continue;
    }
    seenEntries.add(key);
    result.push(word);
  }

  return result;
};

const buildChoices = (
  correctWord: WordEntry,
  allWords: WordEntry[]
): QuizChoice[] | null => {
  const usedMeanings = new Set([correctWord.meaningJa]);
  const distractors: string[] = [];

  for (const word of shuffle(allWords)) {
    if (word.entry === correctWord.entry || usedMeanings.has(word.meaningJa)) {
      continue;
    }

    usedMeanings.add(word.meaningJa);
    distractors.push(word.meaningJa);

    if (distractors.length === 7) {
      break;
    }
  }

  if (distractors.length < 7) {
    return null;
  }

  return shuffle([
    { meaningJa: correctWord.meaningJa, isCorrect: true },
    ...distractors.map((meaningJa) => ({ meaningJa, isCorrect: false }))
  ]).map((choice, index) => ({
    key: CHOICE_KEYS[index],
    ...choice
  }));
};

export const canStartQuiz = (words: WordEntry[]): boolean =>
  uniqueWordsByEntry(words).length >= 8 && uniqueMeaningCount(words) >= 8;

export const buildQuiz = (
  words: WordEntry[],
  requestedQuestionCount: number
): QuizBuildResult => {
  const uniqueWords = uniqueWordsByEntry(words);

  if (!canStartQuiz(uniqueWords)) {
    throw new Error("有効な単語数または選択肢候補が8件未満のため開始できません。");
  }

  const adjustedQuestionCount = Math.min(requestedQuestionCount, uniqueWords.length);
  const questions: QuizQuestion[] = [];

  for (const word of shuffle(uniqueWords)) {
    const choices = buildChoices(word, uniqueWords);
    if (!choices) {
      continue;
    }

    questions.push({ word, choices });
    if (questions.length === adjustedQuestionCount) {
      break;
    }
  }

  if (questions.length === 0) {
    throw new Error("8択を作成できる問題がありません。");
  }

  const finalQuestionCount = questions.length;
  const notice =
    finalQuestionCount < requestedQuestionCount
      ? `有効な単語数が不足しているため、今回は${finalQuestionCount}問で出題します。`
      : undefined;

  return {
    questions,
    adjustedQuestionCount: finalQuestionCount,
    notice
  };
};
