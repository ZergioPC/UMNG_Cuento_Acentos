import { BtnAnim } from "../../../components/BtnAnim";
import { NAME_MAX } from "../score";
import { TriviaHeader } from "./TriviaHeader";

function TriviaIntro({
  name,
  onNameChange,
  onStart,
  onBack,
  onOpenRanking,
  ranking,
  canStart,
}) {
  const top = ranking.slice(0, 3);

  function handleSubmit(event) {
    event.preventDefault();
    if (canStart) onStart();
  }

  return (
    <div className="trivia-panel">
      <TriviaHeader
        title="Trivia de Acentos"
        onBack={onBack}
        backLabel="Volver al inicio"
      />

      <div className="trivia-card">
        <p className="trivia-card__lead">
          Descubre cómo cambian las frases según la región. Responde 10
          preguntas y guarda tu puntaje.
        </p>

        <form className="trivia-form" onSubmit={handleSubmit}>
          <label className="trivia-form__label" htmlFor="trivia-name">
            Tu nombre
          </label>

          <input
            id="trivia-name"
            className="trivia-form__input"
            type="text"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            maxLength={NAME_MAX}
            autoComplete="off"
            placeholder="Ej. Ana"
          />

          <p className="trivia-form__hint">
            De 2 a {NAME_MAX} caracteres. Así aparecerás en el ranking.
          </p>

          <BtnAnim
            type="submit"
            size="lg"
            padding={12}
            borderRadius={12}
            disabled={!canStart}
            className="trivia-cta"
          >
            Empezar trivia
          </BtnAnim>
        </form>

        <section
          className="trivia-ranking-preview"
          aria-label="Mejores puntajes"
        >
          <h2 className="trivia-section-title">Mejores puntajes</h2>

          {top.length === 0 ? (
            <p className="trivia-empty">
              Aún no hay puntajes. ¡Sé el primero!
            </p>
          ) : (
            <ol className="trivia-mini-ranking">
              {top.map((entry, index) => (
                <li key={entry.id} className="trivia-mini-ranking__row">
                  <span className="trivia-mini-ranking__pos">{index + 1}</span>
                  <span className="trivia-mini-ranking__name">
                    {entry.name}
                  </span>
                  <span className="trivia-mini-ranking__score">
                    {entry.score}/{entry.total}
                  </span>
                </li>
              ))}
            </ol>
          )}

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

        <p className="trivia-note">
          Por ahora la trivia es solo de texto. Las preguntas con audio se
          activarán cuando estén disponibles.
        </p>
      </div>
    </div>
  );
}

export { TriviaIntro };
