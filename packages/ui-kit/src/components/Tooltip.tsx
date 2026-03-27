import React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import classnames from "classnames";
import styles from "./Tooltip.module.less";

const Provider = TooltipPrimitive.Provider;

const Root = TooltipPrimitive.Root;

const Trigger = TooltipPrimitive.Trigger;

const Content = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={classnames(styles.content, className)}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
Content.displayName = "Tooltip.Content";

export const Tooltip = { Provider, Root, Trigger, Content };
