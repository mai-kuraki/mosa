import React from "react";
import styles from "./library.module.less";

const LibraryPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Library</h1>
      </header>
      <div className={styles.empty}>
        <div>
          <p className={styles.emptyTitle}>No images imported</p>
          <p className={styles.emptyHint}>Drag a folder here or click to import</p>
        </div>
      </div>
    </div>
  );
};

export default LibraryPage;
