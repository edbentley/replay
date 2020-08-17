import React, { useState, useCallback, useEffect, useRef } from "react";
import { renderCanvas } from "@replay/web";
import { t } from "@replay/core";
import styles from "./styles.module.css";

export function GameView({ Game, gameProps, showReload, assets }) {
  const [rect, ref] = useClientRect();
  const [refreshCount, setRefreshCount] = useState(0);

  let width = 0;
  let height = 0;
  let top = 0;

  if (rect && rect.height && rect.width) {
    const imageHeightToScreen = 667 / 900;
    const imageWidthToScreen = 375 / 460;

    const widthHeightRatio = 375 / 667;

    if (rect.width / rect.height > widthHeightRatio) {
      // wide view
      height = rect.height * imageHeightToScreen;
      width = height * widthHeightRatio;
    } else {
      // narrow view
      width = rect.width * imageWidthToScreen;
      height = width / widthHeightRatio;
    }
    const offset = gameProps.size.maxHeightMargin ? 0 : height * 0.08;
    top = (rect.height - height) / 2 + offset;
  }

  useEffect(() => {
    if (!width || !height) return;

    const canvas = document.getElementById("myCanvas");

    const { cleanup } = renderCanvas(Game(gameProps), {
      loadingTextures: [t.text({ color: "black", text: "Loading..." })],
      assets,
      dimensions: "scale-up",
      canvas,
      windowSize: { width, height },
    });

    return () => {
      cleanup();
    };
  }, [width, height, refreshCount]);

  return (
    <>
      <div
        ref={ref}
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <img
          id="iphone-img"
          style={{
            userSelect: "none",
            objectFit: "contain",
            maxHeight: "100%",
          }}
          src="/img/iPhone8-Portrait-SpaceGray.png"
        />
      </div>
      {showReload && (
        <img
          className={styles.refresh}
          src="/img/reload.svg"
          width={20}
          height={20}
          onClick={() => setRefreshCount((c) => c + 1)}
        />
      )}
      <canvas
        id="myCanvas"
        style={{ position: "absolute", marginTop: top }}
        width={width}
        height={height}
      />
    </>
  );
}

function useClientRect() {
  const localRef = useRef(null);
  const [rect, setRect] = useState(null);

  const update = () => {
    setRect(localRef.current.getBoundingClientRect());
  };

  useEffect(() => {
    window.addEventListener("resize", update, false);
    return () => window.removeEventListener("resize", update, false);
  }, []);

  const measuredRef = useCallback((node) => {
    if (node !== null) {
      localRef.current = node;
      update();
    }
  }, []);

  // Measure image after load
  useEffect(() => {
    const image = document.getElementById("iphone-img");
    image.onload = () => {
      update();
    };
  }, []);

  return [rect, measuredRef];
}
