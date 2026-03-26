import React from "react";
import { NavLink } from "react-router-dom";
import { MonitorDot, Images, Sparkles, Settings } from "lucide-react";
import styles from "./Sidebar.module.less";

const topItems = [
  { to: "/workspace", label: "工作台", icon: MonitorDot },
  { to: "/library", label: "图库", icon: Images },
  { to: "/timeline", label: "时光", icon: Sparkles },
];

const bottomItems = [
  { to: "/settings", label: "设置", icon: Settings },
];

const Sidebar: React.FC = () => {
  return (
    <nav className={styles.nav}>
      <div className={styles.appLogo}>
        <img src="/logo.svg" alt="Mosa" className={styles.logo} />
        <h1 className={styles.productName}>osa</h1>
      </div>
      <div className={styles.topGroup}>
        {topItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }: { isActive: boolean }) =>
              `${styles.link} ${isActive ? styles.linkActive : ""}`
            }
            title={item.label}
          >
            <item.icon size={20} />
          </NavLink>
        ))}
      </div>
      <div className={styles.bottomGroup}>
        {bottomItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }: { isActive: boolean }) =>
              `${styles.link} ${isActive ? styles.linkActive : ""}`
            }
            title={item.label}
          >
            <item.icon size={20} />
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Sidebar;
