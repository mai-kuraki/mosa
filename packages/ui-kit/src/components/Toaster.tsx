import { Toaster as SonnerToaster, toast } from "sonner";
import "./Toaster.module.less";

function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          fontFamily: "var(--font-base)",
          fontSize: "13px",
          borderRadius: "8px",
          border: "1px solid var(--border-default)",
          boxShadow: "var(--shadow-dropdown)",
          background: "var(--bg-primary)",
          color: "var(--fg-primary)",
        },
      }}
    />
  );
}

export { Toaster, toast };
