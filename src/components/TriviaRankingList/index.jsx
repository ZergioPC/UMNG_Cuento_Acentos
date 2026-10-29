function TriviaRankingList({ ranking, highlightId }) {
  if (ranking.length === 0) {
    return <p className="trivia-empty">Aún no hay puntajes. ¡Sé el primero!</p>;
  }

  return (
    <ol className="trivia-ranking">
      {ranking.map((entry, index) => (
        <li
          key={entry.id}
          className={`trivia-ranking__row${
            entry.id === highlightId ? " trivia-ranking__row--current" : ""
          }`}
        >
          <span className="trivia-ranking__pos">{index + 1}</span>
          <span className="trivia-ranking__name">{entry.name}</span>
          <span className="trivia-ranking__score">
            {entry.score}/{entry.total}
          </span>
          <span className="trivia-ranking__percent">{entry.percent}%</span>
        </li>
      ))}
    </ol>
  );
}

export { TriviaRankingList };
