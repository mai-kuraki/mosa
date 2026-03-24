import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.less";

const navItems = [
  { to: "/library", label: "Library", icon: "grid" },
  { to: "/editor", label: "Edit", icon: "sliders" },
  { to: "/batch", label: "Batch", icon: "layers" },
  { to: "/settings", label: "Settings", icon: "settings" },
];

const Sidebar: React.FC = () => {
  return (
    <nav className={styles.nav}>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `${styles.link} ${isActive ? styles.linkActive : ""}`
          }
          title={item.label}
        >
          {item.label.slice(0, 3)}
        </NavLink>
      ))}
    </nav>
  );
};

export default Sidebar;
