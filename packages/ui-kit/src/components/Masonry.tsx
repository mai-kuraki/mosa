import React, { forwardRef } from "react";
import classnames from "classnames";
import styles from "./Masonry.module.less";

export interface MasonryProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Column width in px, used for CSS columns */
  columnWidth?: number;
  /** Gap between items in px */
  gap?: number;
}

const Masonry = forwardRef<HTMLDivElement, MasonryProps>(
  ({ columnWidth = 220, gap = 12, className, style, children, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={classnames(styles.masonry, className)}
        style={{
          columnWidth: `${columnWidth}px`,
          columnGap: `${gap}px`,
          ...style,
        }}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
Masonry.displayName = "Masonry";

export interface MasonryItemProps extends React.HTMLAttributes<HTMLDivElement> {}

const MasonryItem = forwardRef<HTMLDivElement, MasonryItemProps>(
  ({ className, children, ...rest }, ref) => {
    return (
      <div ref={ref} className={classnames(styles.item, className)} {...rest}>
        {children}
      </div>
    );
  },
);
MasonryItem.displayName = "MasonryItem";

export { Masonry, MasonryItem };
