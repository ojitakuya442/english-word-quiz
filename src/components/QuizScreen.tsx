import type { QuizQuestion } from "../types";

type QuizScreenProps = {
  question: QuizQuestion;
  currentIndex: number;
  totalCount: number;
  selectedMeaning?: string;
  showExample: boolean;
  onSelect: (meaningJa: string) => void;
  onToggleExample: () => void;
  onNext: () => void;
};

export const QuizScreen = ({
  question,
  currentIndex,
  totalCount,
  selectedMeaning,
  showExample,
  onSelect,
  onToggleExample,
  onNext
}: QuizScreenProps) => {
  const answered = selectedMeaning !== undefined;
  const isCorrect = selectedMeaning === question.word.meaningJa;
  const hasExample = Boolean(question.word.exampleSentence);
  const isLastQuestion = currentIndex === totalCount - 1;

  return (
    <main className="screen quiz-screen">
      <section className="quiz-card">
        <div className="quiz-progress">
          <span>
            {currentIndex + 1} / {totalCount}
          </span>
          <span>{question.word.datasetLabel}</span>
        </div>

        <div className="word-block">
          {question.word.pos && <p className="pos">{question.word.pos}</p>}
          <h1>{question.word.entry}</h1>
        </div>

        <div className="choice-list">
          {question.choices.map((choice) => {
            const selected = selectedMeaning === choice.meaningJa;
            const className = [
              "choice-button",
              answered && choice.isCorrect ? "correct" : "",
              answered && selected && !choice.isCorrect ? "incorrect" : ""
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <button
                key={`${choice.key}-${choice.meaningJa}`}
                className={className}
                onClick={() => onSelect(choice.meaningJa)}
                disabled={answered}
              >
                <span className="choice-key">{choice.key}</span>
                <span>{choice.meaningJa}</span>
              </button>
            );
          })}
        </div>

        <div className="quiz-actions">
          {hasExample && (
            <button className="secondary-button" onClick={onToggleExample}>
              {showExample ? "例文を隠す" : "例文を見る"}
            </button>
          )}
          {answered && (
            <button className="primary-button" onClick={onNext}>
              {isLastQuestion ? "結果を見る" : "次の問題"}
            </button>
          )}
        </div>

        {showExample && question.word.exampleSentence && (
          <div className="example-box">
            <p>{question.word.exampleSentence}</p>
            {answered && question.word.translatedSentence && (
              <p className="translation">{question.word.translatedSentence}</p>
            )}
          </div>
        )}

        {answered && (
          <div className={isCorrect ? "answer-feedback ok" : "answer-feedback ng"}>
            <strong>{isCorrect ? "正解" : "不正解"}</strong>
            <span>正解: {question.word.meaningJa}</span>
          </div>
        )}
      </section>
    </main>
  );
};
