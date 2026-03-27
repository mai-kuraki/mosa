import React, { forwardRef } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import classnames from "classnames";
import styles from "./Tabs.module.less";

const Root = forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Root ref={ref} className={classnames(styles.root, className)} {...props} />
));
Root.displayName = "Tabs.Root";

const List = forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List ref={ref} className={classnames(styles.list, className)} {...props} />
));
List.displayName = "Tabs.List";

const Trigger = forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger ref={ref} className={classnames(styles.trigger, className)} {...props} />
));
Trigger.displayName = "Tabs.Trigger";

const Content = forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content ref={ref} className={classnames(styles.content, className)} {...props} />
));
Content.displayName = "Tabs.Content";

export const Tabs = { Root, List, Trigger, Content };
