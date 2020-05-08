import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import games from "./made-with-replay.json";
import style from "./styles.module.css";

function Games() {
  return (
    <Layout description="Games made with Replay">
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <main className={style.viewContainer}>
          <h2>Games made with Replay:</h2>
          <ul>
            {games
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((game) => (
                <li key={game.name}>
                  <Link to={game.link}>{game.name}</Link>
                  {game.source && (
                    <>
                      {" · "}
                      <Link to={game.source}>Source</Link>
                    </>
                  )}
                </li>
              ))}
          </ul>
          <p style={{ paddingTop: "1rem" }}>
            Would you like to add yours here?{" "}
            <Link
              to={
                "https://github.com/edbentley/replay/edit/master/website/src/pages/games/made-with-replay.json"
              }
            >
              Send a PR!
            </Link>
          </p>
        </main>
      </div>
    </Layout>
  );
}

export default Games;
