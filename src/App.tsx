import { useEffect, useMemo, useState } from "react";
import { StartScreen } from "./components/StartScreen";
import { QuizScreen } from "./components/QuizScreen";
import { ResultScreen } from "./components/ResultScreen";
import type {
  DatasetConfig,
  DatasetId,
  LoadedDataset,
  QuizQuestion,
  WrongAnswer
} from "./types";
import { loadDatasets } from "./utils/csv";
import {
  buildQuiz,
  CHOICE_COUNT_OPTIONS,
  DEFAULT_CHOICE_COUNT
} from "./utils/quiz";

const DATASETS: DatasetConfig[] = [
  { id: "ngsl", label: "基礎英単語 NGSL", path: "/data/words-ngsl.csv" },
  { id: "tsl", label: "TOEIC英単語 TSL", path: "/data/words-2.csv" },
  { id: "nawl", label: "学術英単語 NAWL", path: "/data/words-3.csv" }
];

const STORAGE_KEYS = {
  datasetId: "english-word-quiz:last-dataset",
  questionCount: "english-word-quiz:last-question-count",
  choiceCount: "english-word-quiz:last-choice-count"
};

type AppMode = "start" | "quiz" | "result";

const readInitialDatasetId = (): DatasetId => {
  const value = localStorage.getItem(STORAGE_KEYS.datasetId);
  return value === "ngsl" || value === "tsl" || value === "nawl" ? value : "all";
};

const readInitialQuestionCount = (): number => {
  const value = Number(localStorage.getItem(STORAGE_KEYS.questionCount));
  return [10, 20, 30, 50, 100, 200].includes(value) ? value : 10;
};

const readInitialChoiceCount = (): number => {
  const value = Number(localStorage.getItem(STORAGE_KEYS.choiceCount));
  return CHOICE_COUNT_OPTIONS.includes(
    value as (typeof CHOICE_COUNT_OPTIONS)[number]
  )
    ? value
    : DEFAULT_CHOICE_COUNT;
};

function App() {
  const [datasets, setDatasets] = useState<LoadedDataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [selectedDatasetId, setSelectedDatasetId] =
    useState<DatasetId>(readInitialDatasetId);
  const [selectedQuestionCount, setSelectedQuestionCount] = useState(
    readInitialQuestionCount
  );
  const [selectedChoiceCount, setSelectedChoiceCount] = useState(
    readInitialChoiceCount
  );
  const [mode, setMode] = useState<AppMode>("start");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedMeaning, setSelectedMeaning] = useState<string>();
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);
  const [showExample, setShowExample] = useState(false);

  useEffect(() => {
    let ignore = false;

    loadDatasets(DATASETS)
      .then((loaded) => {
        if (!ignore) {
          setDatasets(loaded);
          setError(undefined);
        }
      })
      .catch((loadError: unknown) => {
        if (!ignore) {
          const message =
            loadError instanceof Error
              ? loadError.message
              : "CSV読み込み中に不明なエラーが発生しました。";
          setError(message);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.datasetId, selectedDatasetId);
  }, [selectedDatasetId]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.questionCount,
      String(selectedQuestionCount)
    );
  }, [selectedQuestionCount]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.choiceCount, String(selectedChoiceCount));
  }, [selectedChoiceCount]);

  const allWords = useMemo(
    () => datasets.flatMap((dataset) => dataset.words),
    [datasets]
  );

  const selectedWords = useMemo(() => {
    if (selectedDatasetId === "all") {
      return allWords;
    }
    return datasets.find((dataset) => dataset.id === selectedDatasetId)?.words ?? [];
  }, [allWords, datasets, selectedDatasetId]);

  const resetAnswerState = () => {
    setSelectedMeaning(undefined);
    setShowExample(false);
  };

  const startQuiz = () => {
    try {
      const result = buildQuiz(
        selectedWords,
        selectedQuestionCount,
        selectedChoiceCount
      );
      setQuestions(result.questions);
      setNotice(result.notice);
      setCurrentIndex(0);
      setCorrectCount(0);
      setWrongAnswers([]);
      resetAnswerState();
      setMode("quiz");
      setError(undefined);
    } catch (startError: unknown) {
      const message =
        startError instanceof Error
          ? startError.message
          : "クイズを開始できませんでした。";
      setError(message);
    }
  };

  const selectAnswer = (meaningJa: string) => {
    if (selectedMeaning !== undefined) {
      return;
    }

    const currentQuestion = questions[currentIndex];
    setSelectedMeaning(meaningJa);

    if (meaningJa === currentQuestion.word.meaningJa) {
      setCorrectCount((count) => count + 1);
    } else {
      setWrongAnswers((answers) => [
        ...answers,
        {
          word: currentQuestion.word,
          selectedMeaningJa: meaningJa
        }
      ]);
    }
  };

  const nextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      setMode("result");
      return;
    }

    setCurrentIndex((index) => index + 1);
    resetAnswerState();
  };

  if (mode === "quiz" && questions[currentIndex]) {
    return (
      <QuizScreen
        question={questions[currentIndex]}
        currentIndex={currentIndex}
        totalCount={questions.length}
        selectedMeaning={selectedMeaning}
        showExample={showExample}
        onSelect={selectAnswer}
        onToggleExample={() => setShowExample((value) => !value)}
        onNext={nextQuestion}
      />
    );
  }

  if (mode === "result") {
    return (
      <ResultScreen
        totalCount={questions.length}
        correctCount={correctCount}
        wrongAnswers={wrongAnswers}
        onRetrySameSettings={startQuiz}
        onBackToStart={() => {
          setMode("start");
          setNotice(undefined);
        }}
      />
    );
  }

  return (
    <StartScreen
      datasets={datasets}
      selectedDatasetId={selectedDatasetId}
      selectedQuestionCount={selectedQuestionCount}
      selectedChoiceCount={selectedChoiceCount}
      loading={loading}
      error={error}
      notice={notice}
      availableWords={allWords.length}
      onDatasetChange={(datasetId) => {
        setSelectedDatasetId(datasetId);
        setNotice(undefined);
        setError(undefined);
      }}
      onQuestionCountChange={(count) => {
        setSelectedQuestionCount(count);
        setNotice(undefined);
        setError(undefined);
      }}
      onChoiceCountChange={(count) => {
        setSelectedChoiceCount(count);
        setNotice(undefined);
        setError(undefined);
      }}
      onStart={startQuiz}
    />
  );
}

export default App;
