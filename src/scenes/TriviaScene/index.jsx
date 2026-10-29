import { useRef, useState } from "react";

import { Papel } from "../../utils/fondo/Papel";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { QUIZ_SIZE, buildGame } from "./questions";
import {
  createEntry,
  isValidName,
  loadRanking,
  normalizeName,
  saveRanking,
} from "./score";
import { TriviaIntro } from "./components/TriviaIntro";
import { TriviaQuestion } from "./components/TriviaQuestion";
import { TriviaResult } from "./components/TriviaResult";
import { TriviaRanking } from "./components/TriviaRanking";
import "./TriviaScene.css";

function TriviaScene({ onBack }) {
  const reduced = useReducedMotion();

  const [phase, setPhase] = useState("intro");
  const [rankingFrom, setRankingFrom] = useState("intro");
  const [name, setName] = useState("");
  const [game, setGame] = useState(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [ranking, setRanking] = useState(() => loadRanking());

  const startedAtRef = useRef(0);
  const questionStartRef = useRef(0);
  const finishedRef = useRef(false);

  const canStart = isValidName(name);
  const current = game?.questions[index] ?? null;
  const answered = answers[index] ?? null;
  const score = answers.filter((answer) => answer.correct).length;

  function resetGame() {
    setGame(null);
    setIndex(0);
    setAnswers([]);
    setResult(null);
  }

  function startGame(playerName) {
    const clean = normalizeName(playerName);
    if (!isValidName(clean)) return;

    const questions = buildGame(QUIZ_SIZE);
    if (questions.length === 0) return;

    setName(clean);
    setGame({ questions });
    setIndex(0);
    setAnswers([]);
    setResult(null);
    finishedRef.current = false;

    startedAtRef.current = performance.now();
    questionStartRef.current = performance.now();
    setPhase("playing");
  }

  function handleAnswer(optionId) {
    if (!current) return;

    setAnswers((prev) => {
      if (prev[index]) return prev;

      return [
        ...prev,
        {
          questionId: current.id,
          chosenId: optionId,
          correct: optionId === current.correctId,
          elapsedMs: Math.round(performance.now() - questionStartRef.current),
        },
      ];
    });
  }

  function handleNext() {
    if (!game || !answers[index]) return;

    const isLast = index === game.questions.length - 1;

    if (!isLast) {
      setIndex((prev) => prev + 1);
      questionStartRef.current = performance.now();
      return;
    }

    // Un doble clic en "Ver resultados" no debe guardar dos entradas.
    if (finishedRef.current) return;
    finishedRef.current = true;

    const total = game.questions.length;
    const finalScore = answers.filter((answer) => answer.correct).length;
    const entry = createEntry({
      name,
      score: finalScore,
      total,
      durationMs: Math.round(performance.now() - startedAtRef.current),
    });

    setRanking(saveRanking(entry));
    setResult(entry);
    setPhase("results");
  }

  function exitTrivia() {
    resetGame();
    setPhase("intro");
    onBack();
  }

  function playAgain() {
    startGame(name);
  }

  function openRanking(from) {
    setRankingFrom(from);
    setPhase("ranking");
  }

  function closeRanking() {
    setPhase(rankingFrom);
  }

  return (
    <section
      className={`trivia-scene position-relative h-100 overflow-hidden${
        reduced ? " trivia-scene--reduced" : ""
      }`}
    >
      <Papel />

      <div className="trivia-scene__scroll">
        {phase === "intro" && (
          <TriviaIntro
            name={name}
            onNameChange={setName}
            onStart={() => startGame(name)}
            onBack={exitTrivia}
            onOpenRanking={() => openRanking("intro")}
            ranking={ranking}
            canStart={canStart}
          />
        )}

        {phase === "playing" && current && (
          <TriviaQuestion
            question={current}
            answered={answered}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onExit={exitTrivia}
            index={index}
            total={game.questions.length}
            score={score}
            isLast={index === game.questions.length - 1}
          />
        )}

        {phase === "results" && result && (
          <TriviaResult
            result={result}
            ranking={ranking}
            onPlayAgain={playAgain}
            onHome={exitTrivia}
            onOpenRanking={() => openRanking("results")}
          />
        )}

        {phase === "ranking" && (
          <TriviaRanking
            ranking={ranking}
            onBack={closeRanking}
            highlightId={result?.id}
          />
        )}
      </div>
    </section>
  );
}

export { TriviaScene };
