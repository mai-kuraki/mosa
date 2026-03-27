import React from "react";
import classnames from "classnames";
import styles from "./Slider.module.less";

interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  onChange: (value: number) => void;
  className?: string;
}

const Slider: React.FC<SliderProps> = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  label,
  onChange,
  className,
}) => {
  return (
    <div className={classnames(styles.container, className)}>
      {label && (
        <div className={styles.labelRow}>
          <span>{label}</span>
          <span className={styles.value}>{value}</span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={styles.input}
      />
    </div>
  );
};

export default Slider;
