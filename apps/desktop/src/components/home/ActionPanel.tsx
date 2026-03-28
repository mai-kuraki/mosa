import React from "react";
import { useNavigate } from "react-router-dom";
import { Images, Sparkles, Settings, ArrowRight, Menu } from "lucide-react";
import TextType from "../reactbits/TextType";
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@mosa/ui-kit";
import styles from "./ActionPanel.module.less";

interface ActionPanelProps {
  onStart?: (btnRect: DOMRect) => void;
}

const ActionPanel: React.FC<ActionPanelProps> = ({ onStart }) => {
  const navigate = useNavigate();

  const handleImport = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onStart) {
      onStart(e.currentTarget.getBoundingClientRect());
    } else {
      navigate("/workspace");
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.content}>
        {/* Hero: Logo + Product name */}
        <div className={styles.hero}>
          <img src="/logo.svg" alt="Mosa" className={styles.logo} />
          <h1 className={styles.productName}>osa</h1>
        </div>

        {/* Slogan */}
        <div className={styles.sloganBlock}>
          <TextType
            text={[
              "Reconstruct the Logic of Light.",
              "Deconstructing color, Redefining the moment",
            ]}
            className={styles.sloganEn}
            typingSpeed={60}
            deletingSpeed={30}
            pauseDuration={3000}
            initialDelay={500}
            loop
            showCursor
            cursorCharacter="_"
            cursorClassName={styles.sloganCursor}
          />
          <p className={styles.sloganCn}>
            重构光的逻辑，
            <br />
            解构色彩边界，重新定义决定性瞬间。
          </p>
        </div>
        <div style={{ flex: 1 }} />
        {/* Actions */}
        <div className={styles.actions}>
          <Button variant="primary" size="lg" className={styles.btnPrimary} onClick={handleImport}>
            开始重构影调
            <ArrowRight size={20} style={{ marginLeft: 10 }} />
          </Button>
        </div>
      </div>

      {/* Bottom-left menu */}
      <div className={styles.menuAnchor}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="md" iconOnly className={styles.menuTrigger} aria-label="菜单">
              <Menu size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" sideOffset={10}>
            <DropdownMenuItem onSelect={() => navigate("/library")}>
              <Images size={16} />
              图库
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate("/timeline")}>
              <Sparkles size={16} />
              时光
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate("/settings")}>
              <Settings size={16} />
              设置
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ActionPanel;
