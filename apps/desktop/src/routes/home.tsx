import React from "react";
import CompareSlider from "../components/home/CompareSlider";
import ActionPanel from "../components/home/ActionPanel";
import styles from "./home.module.less";

const beforeImg = "showcase/exp_before.jpg";
const afterImg = "showcase/exp_after.jpg";

const HomePage: React.FC = () => {
  return (
    <div className={styles.page}>
      {/* Invisible drag region for native traffic lights */}
      <div className={styles.dragRegion} />

      <div className={styles.actionArea}>
        <ActionPanel />
      </div>
      <div className={styles.compareArea}>
        <CompareSlider
          beforeSrc={beforeImg}
          afterSrc={afterImg}
          beforeLabel="RAW"
          afterLabel="M9"
        />
      </div>
    </div>
  );
};

export default HomePage;
