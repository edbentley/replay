import React, { useState } from "react";
import Highlight, { defaultProps } from "prism-react-renderer";
import theme from "prism-react-renderer/themes/palenight";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import classnames from "classnames";
import styles from "./styles.module.css";

export function CodeFiles({ codesTs, codesJs }) {
  return (
    <Tabs
      defaultValue="js"
      groupId="code"
      values={[
        { label: "JavaScript", value: "js" },
        { label: "TypeScript", value: "ts" },
      ]}
    >
      <TabItem value="js">
        <CodeFilesOneLang lang="js" codes={codesJs} />
      </TabItem>
      <TabItem value="ts">
        <CodeFilesOneLang lang="ts" codes={codesTs} />
      </TabItem>
    </Tabs>
  );
}

function CodeFilesOneLang({ lang, codes }) {
  const files = codes.map(({ file }) => file);

  const [viewingFile, setViewingFile] = useState(files[0]);

  const codeFile = codes.find(({ file }) => file === viewingFile);

  return (
    <div style={{ marginTop: -12 }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          backgroundColor: "white",
          zIndex: 1,
        }}
      >
        {files.map((file) => (
          <button
            className={
              styles.fileButton +
              (viewingFile === file ? ` ${styles.fileButtonSelected}` : "")
            }
            key={file}
            onClick={() => setViewingFile(file)}
          >
            {file}
          </button>
        ))}
      </div>
      <CodeBlock
        key={codeFile.file}
        lang={lang}
        code={codeFile.code}
        highlight={codeFile.highlight}
      />
    </div>
  );
}

function CodeBlock({ lang, code, highlight }) {
  const formattedCode = code
    .replace("/img/bird.png", "bird.png")
    .replace("/audio/boop.wav", "boop.wav");
  return (
    <Highlight
      {...defaultProps}
      theme={theme}
      code={formattedCode}
      language={lang}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <div className={styles.codeBlockContent}>
          <div tabIndex="0" className={classnames(className, styles.codeBlock)}>
            <div className={styles.codeBlockLines} style={style}>
              {tokens.map((line, i) => {
                if (line.length === 1 && line[0].content === "") {
                  line[0].content = "\n";
                }

                const lineProps = getLineProps({ line, key: i });

                const highlightExpanded = highlight?.flatMap((h) => {
                  if (typeof h === "number") return h;
                  const [start, end] = h.split("-").map(Number);
                  return Array.from({ length: end - start + 1 }).map(
                    (_, i) => i + start
                  );
                });
                if (highlightExpanded?.includes(i + 1)) {
                  lineProps.className += " docusaurus-highlight-code-line";
                }

                return (
                  <div {...lineProps}>
                    <span
                      style={{
                        display: "inline-block",
                        width: 30,
                        textAlign: "right",
                        marginRight: 16,
                        opacity: 0.5,
                        userSelect: "none",
                      }}
                    >
                      {i + 1}
                    </span>
                    {line.map((token, key) => (
                      <span {...getTokenProps({ token, key })} />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Highlight>
  );
}
