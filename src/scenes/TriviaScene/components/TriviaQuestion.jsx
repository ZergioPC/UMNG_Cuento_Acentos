import { BtnAnim } from "../../../components/BtnAnim";
import {
  REGION_ICONS,
  REGION_PALETTES,
} from "../../../utils/CuentoComparer/constants";
import { TriviaHeader } from "./TriviaHeader";
import { TriviaVariants } from "./TriviaVariants";

const TYPE_LABELS = {
  region: "¿De qué región?",
  "region-match": "Encuentra la frase",
  "true-false": "Verdadero o falso",
};

const CORRECT_COLOR = "#2e9e5b";
const WRONG_COLOR = "#e94b4b";
const MUTED_COLOR = "#6b7280";
const DEFAULT_COLOR = "#2bb0fd";

function TriviaQuestion({
  question,
  answered,
  onAnswer,
  onNext,
  onExit,
  index,
  total,
  score,
  isLast,
}) {
  const chosenId = answered?.chosenId ?? null;
  const isAnswered = answered !== null;
  const isRegionQuestion = question.type === "region";

  function optionColor(option) {
    if (!isAnswered) {
      // Solo las opciones de región llevan su color. En "encuentra la frase"
      // las opciones también traen region, pero pintarlas delataría la
      // respuesta correcta.
      return question.type === "region" && option.region
        ? REGION_PALETTES[option.region].border
        : DEFAULT_COLOR;
    }

    if (option.id === question.correctId) return CORRECT_COLOR;
    if (option.id === chosenId) return WRONG_COLOR;
    return MUTED_COLOR;
  }

  return (
    <div className="trivia-panel">
      <TriviaHeader
        title={`Pregunta ${index + 1} de ${total}`}
        onBack={onExit}
        backLabel="Salir de la trivia"
      />

      <div className="trivia-status">
        <span className="trivia-status__score">Aciertos: {score}</span>

        <div
          className="trivia-progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={index + (isAnswered ? 1 : 0)}
          aria-label="Progreso de la trivia"
        >
          {Array.from({ length: total }, (_, step) => (
            <span
              key={step}
              className={`trivia-progress__step${
                step < index || (step === index && isAnswered)
                  ? " trivia-progress__step--done"
                  : ""
              }${step === index && !isAnswered ? " trivia-progress__step--current" : ""}`}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>

      <article className="trivia-card">
        <p className="visually-hidden" role="status" aria-live="polite">
          {isAnswered
            ? `${answered.correct ? "Correcto" : "Incorrecto"}. ${
                question.explanation
              }`
            : ""}
        </p>

        <span className="trivia-badge">{TYPE_LABELS[question.type]}</span>

        <p className="trivia-question__prompt">{question.prompt}</p>

        {question.quote && (
          <blockquote className="trivia-question__quote">
            «{question.quote}»
          </blockquote>
        )}

        <div
          className={`trivia-options${
            isRegionQuestion ? " trivia-options--regions" : ""
          }`}
          role="group"
          aria-label="Opciones de respuesta"
        >
          {question.options.map((option) => {
            const Icon = option.region ? REGION_ICONS[option.region] ?? null : null;
            const isCorrect = option.id === question.correctId;
            const isChosen = option.id === chosenId;
            const marker = isAnswered && isCorrect ? "✓ " : isAnswered && isChosen ? "✗ " : "";

            return (
              <BtnAnim
                key={option.id}
                color={optionColor(option)}
                size={isRegionQuestion ? 80 : "md"}
                padding={isRegionQuestion ? 6 : 14}
                borderRadius={isRegionQuestion ? 18 : 14}
                shadowSize={isRegionQuestion ? 6 : 5}
                square={isRegionQuestion}
                disabled={isAnswered}
                className={`trivia-option${
                  isRegionQuestion ? " trivia-option--region" : ""
                }`}
                onClick={() => onAnswer(option.id)}
                aria-label={option.label}
              >
                {isRegionQuestion ? (
                  <>
                    {Icon && <Icon size={28} color="#fff" />}
                    <span className="trivia-option__label">
                      {marker}
                      {option.label}
                    </span>
                  </>
                ) : (
                  <span className="trivia-option__text">
                    {marker}
                    {option.label}
                  </span>
                )}
              </BtnAnim>
            );
          })}
        </div>

        {isAnswered && (
          <div
            className={`trivia-feedback${
              answered.correct
                ? " trivia-feedback--ok"
                : " trivia-feedback--ko"
            }`}
          >
            <p className="trivia-feedback__title">
              {answered.correct ? "¡Correcto!" : "No era esa."}
            </p>
            <p className="trivia-feedback__text">{question.explanation}</p>

            <TriviaVariants
              variants={question.variants}
              highlightRegion={question.highlightRegion}
            />
          </div>
        )}

        {isAnswered && (
          <div className="trivia-actions">
            <BtnAnim
              size="md"
              padding={12}
              borderRadius={12}
              color={CORRECT_COLOR}
              onClick={onNext}
              autoFocus
              className="trivia-next"
            >
              {isLast ? "Ver resultados" : "Siguiente"}
            </BtnAnim>
          </div>
        )}
      </article>
    </div>
  );
}

export { TriviaQuestion };
