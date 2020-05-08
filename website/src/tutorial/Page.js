import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import BrowserOnly from "@docusaurus/BrowserOnly";
import { CodeFiles } from "./CodeFiles";
import { GameView } from "./GameView";

export function Page({
  part,
  MDXContent,
  codesTs,
  codesJs,
  Game,
  gameProps,
  image,
  isEnd,
  assets,
}) {
  const hasCode = codesTs && codesJs;

  const rightPanel =
    Game && gameProps ? (
      <BrowserOnly fallback={<div>Preview</div>}>
        {() => (
          <GameView
            Game={Game}
            gameProps={gameProps}
            showReload={hasCode}
            assets={assets}
          />
        )}
      </BrowserOnly>
    ) : (
      <div>
        <img src={image} />
      </div>
    );

  return (
    <Layout title={`Tutorial - Part ${part}`} noFooter>
      <div
        style={{
          display: "flex",
          minWidth: 1024,
          height: "calc(100vh - 60px)",
        }}
      >
        <div
          style={{
            flex: "1",
            overflow: "auto",
            padding: 16,
            borderRight: "1px solid #ededed",
          }}
        >
          <MDXContent />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {part > 1 ? (
              <Link to={`/tutorial/${part - 1}`}>Back</Link>
            ) : (
              <div />
            )}
            {!isEnd ? <Link to={`/tutorial/${part + 1}`}>Next</Link> : <div />}
          </div>
        </div>
        {hasCode ? (
          <>
            <div
              style={{
                flex: "1",
                overflow: "auto",
                borderRight: "1px solid #ededed",
              }}
            >
              <CodeFiles codesTs={codesTs} codesJs={codesJs} />
            </div>
            <div
              style={{
                flex: "1",
                display: "flex",
                justifyContent: "center",
              }}
            >
              {rightPanel}
            </div>
          </>
        ) : (
          <div
            style={{
              flex: "2",
              display: "flex",
              justifyContent: "center",
            }}
          >
            {rightPanel}
          </div>
        )}
      </div>
    </Layout>
  );
}
