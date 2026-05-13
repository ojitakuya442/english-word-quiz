import type { WrongAnswer } from "../types";

type ResultScreenProps = {
  totalCount: number;
  correctCount: number;
  wrongAnswers: WrongAnswer[];
  onRetrySameSettings: () => void;
  onBackToStart: () => void;
};

export const ResultScreen = ({
  totalCount,
  correctCount,
  wrongAnswers,
  onRetrySameSettings,
  onBackToStart
}: ResultScreenProps) => {
  const wrongCount = totalCount - correctCount;
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  return (
    <main className="screen result-screen">
      <section className="panel">
        <p className="eyebrow">Result</p>
        <h1>結果</h1>

        <div className="score-grid">
          <div>
            <span>出題数</span>
            <strong>{totalCount}</strong>
          </div>
          <div>
            <span>正解数</span>
            <strong>{correctCount}</strong>
          </div>
          <div>
            <span>不正解</span>
            <strong>{wrongCount}</strong>
          </div>
          <div>
            <span>正答率</span>
            <strong>{accuracy}%</strong>
          </div>
        </div>

        <div className="result-actions">
          <button className="primary-button" onClick={onRetrySameSettings}>
            もう一度同じ条件で挑戦
          </button>
          <button className="secondary-button" onClick={onBackToStart}>
            設定を変えて再挑戦
          </button>
        </div>
      </section>

      <section className="panel wrong-list">
        <h2>間違えた単語</h2>
        {wrongAnswers.length === 0 ? (
          <p className="status notice">全問正解です。</p>
        ) : (
          wrongAnswers.map((answer) => (
            <article key={`${answer.word.entry}-${answer.selectedMeaningJa}`}>
              <h3>{answer.word.entry}</h3>
              <dl>
                <div>
                  <dt>正解</dt>
                  <dd>{answer.word.meaningJa}</dd>
                </div>
                <div>
                  <dt>選択</dt>
                  <dd>{answer.selectedMeaningJa}</dd>
                </div>
              </dl>
              {answer.word.exampleSentence && <p>{answer.word.exampleSentence}</p>}
              {answer.word.translatedSentence && (
                <p className="translation">{answer.word.translatedSentence}</p>
              )}
            </article>
          ))
        )}
      </section>
    </main>
  );
};
