import { TriviaHeader } from "./TriviaHeader";
import { TriviaRankingList } from "./TriviaRankingList";

function TriviaRanking({ ranking, onBack, highlightId }) {
  return (
    <div className="trivia-panel">
      <TriviaHeader title="Ranking" onBack={onBack} />

      <div className="trivia-card">
        <p className="trivia-card__lead">
          Los 10 mejores puntajes guardados en este navegador.
        </p>

        <TriviaRankingList ranking={ranking} highlightId={highlightId} />
      </div>
    </div>
  );
}

export { TriviaRanking };
