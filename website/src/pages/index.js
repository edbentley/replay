import React from "react";
import classnames from "classnames";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";

const features = [
  {
    title: <>Declarative API</>,
    description: (
      <>
        Replay works differently to traditional OOP game engines. Game logic and
        rendering is neatly separated using pure functions.
      </>
    ),
  },
  {
    title: <>Tooling</>,
    description: (
      <>
        Build your game once using the latest and greatest frontend tools. Then
        deploy to web and iOS!
      </>
    ),
  },
  {
    title: <>Easy to test</>,
    description: (
      <>
        Replay includes an intuitive testing library to ensure your game never
        breaks.
      </>
    ),
  },
];

function Feature({ title, description }) {
  return (
    <div className={classnames("col col--4", styles.feature)}>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  return (
    <Layout description="Description will go into a meta tag in <head />">
      <header className={classnames("hero hero--primary", styles.heroBanner)}>
        <div className="container">
          <img src="/img/logo-dark.svg" height={100} />
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            {/* <Link
              className={classnames("button button--lg", styles.startTutorial)}
              to={useBaseUrl("tutorial")}
            >
              Start Tutorial
            </Link> */}
            <Link
              className={classnames("button button--lg", styles.readDocs)}
              to={useBaseUrl("docs/intro")}
            >
              Read Docs
            </Link>
          </div>
        </div>
      </header>
      <main>
        {features && features.length && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}

export default Home;
