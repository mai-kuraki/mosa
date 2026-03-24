import React from "react";
import { useParams } from "react-router-dom";
import styles from "./editor.module.less";

const EditorPage: React.FC = () => {
  const { imageId } = useParams();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Editor</h1>
      </header>
      <div className={styles.body}>
        <div className={styles.canvas}>
          {imageId ? (
            <p>Editing image: {imageId}</p>
          ) : (
            <p>Select an image from the library to edit</p>
          )}
        </div>
        <aside className={styles.panel}>
          <h2 className={styles.panelTitle}>Camera Style</h2>
          <div className={styles.presetList}>
            <button className={styles.presetBtn}>Leica M9</button>
            <button className={styles.presetBtn}>Leica M3</button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default EditorPage;
