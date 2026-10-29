import { BtnAnim } from "../BtnAnim";
import { MAX_ENTRIES } from "../../scenes/TriviaScene/score";
import { TriviaHeader } from "../TriviaHeader";
import { TriviaRankingList } from "../TriviaRankingList";

const TIERS = [
  {
    min: 100,
    title: "¡Perfecto!",
    text: "Reconoces los acentos de todas las regiones.",
  },
  {
    min: 80,
    title: "¡Muy bien!",
    text: "Se te escapan pocos regionalismos.",
  },
  {
    min: 50,
    title: "¡Buen oído!",
    text: "Ya reconoces varias expresiones. Sigue practicando.",
  },
  {
    min: 0,
    title: "Sigue practicando",
    text: "Vuelve a los cuentos y prueba otra vez.",
  },
];

function TriviaResult({ result, ranking, onPlayAgain, onHome, onOpenRanking }) {
  const tier = TIERS.find((item) => result.percent >= item.min) ?? TIERS[TIERS.length - 1];
  const position = ranking.findIndex((entry) => entry.id === result.id) + 1;

  return (
    <div className="trivia-panel">
      <TriviaHeader
        title="Resultado"
        onBack={onHome}
        backLabel="Volver al inicio"
      />

      <div className="trivia-card trivia-result">
        <p className="trivia-result__eyebrow">{result.name}</p>

        <p className="trivia-result__score">
          {result.score}
          <span>/{result.total}</span>
        </p>

        <p className="trivia-result__percent">
          {result.percent}% de aciertos
        </p>

        <h2 className="trivia-result__title">{tier.title}</h2>
        <p className="trivia-result__text">{tier.text}</p>

        {position > 0 ? (
          <p className="trivia-result__position">
            Entraste al top {ranking.length} en el puesto {position}.
          </p>
        ) : (
          <p className="trivia-result__position">
            No entraste al top {MAX_ENTRIES} esta vez.
          </p>
        )}

        <div className="trivia-result__actions">
          <BtnAnim
            size="md"
            padding={12}
            borderRadius={12}
            onClick={onPlayAgain}
          >
            Jugar de nuevo
          </BtnAnim>

          <BtnAnim
            color="#e94b4b"
            size="sm"
            padding={10}
            borderRadius={12}
            onClick={onHome}
          >
            Volver al inicio
          </BtnAnim>
        </div>

        <section
          className="trivia-result__ranking"
          aria-label="Mejores puntajes"
        >
          <h2 className="trivia-section-title">Mejores puntajes</h2>

          <TriviaRankingList ranking={ranking} highlightId={result.id} />

          {ranking.length > 0 && (
            <BtnAnim
              size="sm"
              padding={8}
              borderRadius={12}
              onClick={onOpenRanking}
              className="trivia-secondary"
            >
              Ver ranking completo
            </BtnAnim>
          )}
        </section>
      </div>
    </div>
  );
}

export { TriviaResult };
