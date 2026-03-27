import React, { forwardRef } from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import classnames from "classnames";
import styles from "./ToggleGroup.module.less";

const Root = forwardRef<
  React.ComponentRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <ToggleGroupPrimitive.Root ref={ref} className={classnames(styles.root, className)} {...props} />
));
Root.displayName = "ToggleGroup.Root";

const Item = forwardRef<
  React.ComponentRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <ToggleGroupPrimitive.Item ref={ref} className={classnames(styles.item, className)} {...props} />
));
Item.displayName = "ToggleGroup.Item";

export const ToggleGroup = { Root, Item };
