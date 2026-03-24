import React from "react";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  className = "",
}) => {
  const percent = Math.round((value / max) * 100);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <div className="flex justify-between text-xs text-fg-secondary">
          <span>{label}</span>
          <span className="font-mono">{percent}%</span>
        </div>
      )}
      <div className="w-full h-1.5 rounded-full bg-bg-tertiary overflow-hidden">
        <div
          className="h-full rounded-full bg-accent-primary transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
