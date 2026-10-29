import { TriviaVariants } from "../TriviaVariants";

// Solo el contenido informativo: el botón de avanzar vive en la hoja que lo
// contiene (TriviaScene), para que quede siempre visible mientras el texto se
// desplaza por dentro. La hoja se mantiene montada y se muestra con
// "is-active", así que aquí `answered` puede llegar vacío mientras está oculta.
function TriviaFeedback({ question, answered }) {
  const correct = answered?.correct ?? false;

  return (
    <div
      className={`trivia-feedback${
        correct ? " trivia-feedback--ok" : " trivia-feedback--ko"
      }`}
    >
      <p className="trivia-feedback__title">
        {correct ? "¡Correcto!" : "No era esa."}
      </p>

      <p className="trivia-feedback__text">{question.explanation}</p>

      <TriviaVariants
        variants={question.variants}
        highlightRegion={question.highlightRegion}
      />
    </div>
  );
}

export { TriviaFeedback };
