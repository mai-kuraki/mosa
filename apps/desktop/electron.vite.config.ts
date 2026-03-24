import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// Resolve workspace packages directly to TypeScript source for Vite bundling.
// This avoids ESM resolution issues with tsc-compiled dist (missing .js extensions).
const workspaceAliases = {
  "@mosa/shared-utils": resolve(__dirname, "../../packages/shared-utils/src/index.ts"),
  "@mosa/ipc-bridge": resolve(__dirname, "../../packages/ipc-bridge/src/index.ts"),
  "@mosa/render-engine": resolve(__dirname, "../../packages/render-engine/src/index.ts"),
  "@mosa/ui-kit": resolve(__dirname, "../../packages/ui-kit/src/index.ts"),
};

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({ exclude: ["@mosa/shared-utils", "@mosa/ipc-bridge", "@mosa/render-engine"] })],
    resolve: {
      alias: workspaceAliases,
    },
    build: {
      outDir: "dist/electron",
      rollupOptions: {
        input: {
          main: resolve(__dirname, "electron/main.ts"),
        },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin({ exclude: ["@mosa/shared-utils", "@mosa/ipc-bridge"] })],
    resolve: {
      alias: workspaceAliases,
    },
    build: {
      outDir: "dist/preload",
      rollupOptions: {
        input: {
          preload: resolve(__dirname, "electron/preload.ts"),
        },
      },
    },
  },
  renderer: {
    root: "src",
    publicDir: resolve(__dirname, "resources"),
    build: {
      outDir: "../dist/renderer",
      rollupOptions: {
        input: {
          index: resolve(__dirname, "src/index.html"),
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
        ...workspaceAliases,
      },
    },
  },
});
