import React from "react";
import styles from "./workspace.module.less";

const WorkspacePage: React.FC = () => {
  return (
    <div className={styles.page}>
      <div className={styles.empty}>
        <div>
          <p className={styles.emptyTitle}>工作台</p>
          <p className={styles.emptyHint}>导入图片开始重构影调</p>
        </div>
      </div>
    </div>
  );
};

export default WorkspacePage;
