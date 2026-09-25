import { useRef, useState } from "react";
import "./App.css";

import { HomeScene } from "./scenes/HomeScene";
import { SelectCuentoScene } from "./scenes/SelectCuentoScene";
import { MapScene } from "./scenes/MapScene";
import { CuentoScene } from "./scenes/CuentoScene";

import { PageFlipBook } from "./utils/Transitions/PageFlipBook";
import { stop as stopAudio } from "./utils/audio";

const PAGE = {
  HOME: 0,
  SELECT: 1,
  MAP: 2,
  CUENTO: 3,
};

function App() {
  const [cuento, setCuento] = useState(null);
  const [region, setRegion] = useState(null);
  const book = useRef(null);

  function handlePageChange(index, previous) {
    if (previous === PAGE.CUENTO) stopAudio();
    book.current?.resetScroll(index);
  }

  function handleStart() {
    book.current?.goTo(PAGE.SELECT);
  }

  function handlePickCuento(selected) {
    setCuento(selected);
    setRegion(null);
    book.current?.goTo(PAGE.MAP);
  }

  function handleSelectRegion(selected) {
    setRegion(selected);
    book.current?.goTo(PAGE.CUENTO);
  }

  return (
    <PageFlipBook ref={book} onPageChange={handlePageChange}>
      <HomeScene onStart={handleStart} />

      <SelectCuentoScene
        onSelect={handlePickCuento}
        onBack={() => book.current?.goTo(PAGE.HOME)}
      />

      <MapScene
        cuento={cuento}
        region={region}
        onSelectRegion={handleSelectRegion}
        onBack={() => book.current?.goTo(PAGE.SELECT)}
      />

      <CuentoScene
        cuento={cuento}
        region={region}
        onBack={() => book.current?.goTo(PAGE.MAP)}
      />
    </PageFlipBook>
  );
}

export default App;
