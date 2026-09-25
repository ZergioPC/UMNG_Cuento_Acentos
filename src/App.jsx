import { useState } from "react";
import "./App.css";

import { HomeScene } from "./scenes/HomeScene";
import { SelectCuentoScene } from "./scenes/SelectCuentoScene";
import { MapScene } from "./scenes/MapScene";
import { CuentoScene } from "./scenes/CuentoScene";

function App() {
  const [scene, setScene] = useState("home");
  const [cuento, setCuento] = useState(null);
  const [region, setRegion] = useState(null);

  function handleStart() {
    setScene("select");
  }

  function handlePickCuento(cuento) {
    setCuento(cuento);
    setRegion(null);
    setScene("mapa");
  }

  function handleSelectRegion(region) {
    setRegion(region);
    setScene("cuento");
  }

  return (
    <>
      {scene === "home" && <HomeScene onStart={handleStart} />}

      {scene === "select" && (
        <SelectCuentoScene
          onSelect={handlePickCuento}
          onBack={() => setScene("home")}
        />
      )}

      {scene === "mapa" && (
        <MapScene
          cuento={cuento}
          region={region}
          onSelectRegion={handleSelectRegion}
          onBack={() => setScene("select")}
        />
      )}

      {scene === "cuento" && (
        <CuentoScene
          cuento={cuento}
          region={region}
          onBack={() => setScene("mapa")}
        />
      )}
    </>
  );
}

export default App