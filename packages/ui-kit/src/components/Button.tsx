import React, { forwardRef } from "react";
import classnames from "classnames";
import styles from "./Button.module.less";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  iconOnly?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "secondary", size = "md", iconOnly = false, className, disabled, children, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        className={classnames(
          styles.button,
          styles[variant],
          styles[size],
          iconOnly && styles.iconOnly,
          disabled && styles.disabled,
          className,
        )}
        disabled={disabled}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
