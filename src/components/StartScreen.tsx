import type { DatasetId, LoadedDataset } from "../types";
import { CHOICE_COUNT_OPTIONS, canStartQuiz } from "../utils/quiz";

type StartScreenProps = {
  datasets: LoadedDataset[];
  selectedDatasetId: DatasetId;
  selectedQuestionCount: number;
  selectedChoiceCount: number;
  loading: boolean;
  error?: string;
  notice?: string;
  availableWords: number;
  onDatasetChange: (datasetId: DatasetId) => void;
  onQuestionCountChange: (count: number) => void;
  onChoiceCountChange: (count: number) => void;
  onStart: () => void;
};

const QUESTION_COUNTS = [10, 20, 30, 50, 100, 200];

export const StartScreen = ({
  datasets,
  selectedDatasetId,
  selectedQuestionCount,
  selectedChoiceCount,
  loading,
  error,
  notice,
  availableWords,
  onDatasetChange,
  onQuestionCountChange,
  onChoiceCountChange,
  onStart
}: StartScreenProps) => {
  const selectedWords =
    selectedDatasetId === "all"
      ? datasets.flatMap((dataset) => dataset.words)
      : datasets.find((dataset) => dataset.id === selectedDatasetId)?.words ?? [];
  const startDisabled =
    loading ||
    Boolean(error) ||
    !canStartQuiz(selectedWords, selectedChoiceCount);

  return (
    <main className="screen start-screen">
      <section className="app-header">
        <p className="eyebrow">English to Japanese</p>
        <h1>英単語8択クイズ</h1>
        <p>
          CSVに同梱した単語データから、英単語の日本語訳を8択でテンポよく確認できます。
        </p>
      </section>

      <section className="panel">
        <label className="field">
          <span>データセット</span>
          <select
            value={selectedDatasetId}
            onChange={(event) => onDatasetChange(event.target.value as DatasetId)}
            disabled={loading}
          >
            <option value="all">すべて</option>
            {datasets.map((dataset) => (
              <option key={dataset.id} value={dataset.id}>
                {dataset.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>問題数</span>
          <select
            value={selectedQuestionCount}
            onChange={(event) => onQuestionCountChange(Number(event.target.value))}
            disabled={loading}
          >
            {QUESTION_COUNTS.map((count) => (
              <option key={count} value={count}>
                {count}問
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>選択肢数</span>
          <select
            value={selectedChoiceCount}
            onChange={(event) => onChoiceCountChange(Number(event.target.value))}
            disabled={loading}
          >
            {CHOICE_COUNT_OPTIONS.map((count) => (
              <option key={count} value={count}>
                {count}択
              </option>
            ))}
          </select>
        </label>

        <div className="meta-grid">
          <div>
            <span className="meta-label">読み込み済み</span>
            <strong>{availableWords.toLocaleString()}語</strong>
          </div>
          <div>
            <span className="meta-label">選択中</span>
            <strong>{selectedWords.length.toLocaleString()}語</strong>
          </div>
        </div>

        {loading && <p className="status">CSVを読み込んでいます...</p>}
        {notice && <p className="status notice">{notice}</p>}
        {error && <p className="status error">{error}</p>}
        {!loading &&
          !error &&
          selectedWords.length > 0 &&
          !canStartQuiz(selectedWords, selectedChoiceCount) && (
          <p className="status error">
            有効な単語数または選択肢候補が{selectedChoiceCount}件未満のため開始できません。
          </p>
        )}

        <button className="primary-button" onClick={onStart} disabled={startDisabled}>
          スタート
        </button>
      </section>
    </main>
  );
};
