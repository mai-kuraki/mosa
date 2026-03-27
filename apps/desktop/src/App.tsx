import React from "react";
import { HashRouter, Routes, Route, Outlet } from "react-router-dom";
import HomePage from "./routes/home";
import WorkspacePage from "./routes/workspace";
import LibraryPage from "./routes/library";
import TimelinePage from "./routes/timeline";
import SettingsPage from "./routes/settings";
import Sidebar from "./components/shared/Sidebar";
import { Toaster } from "@mosa/ui-kit";
import styles from "./App.module.less";

const AppLayout: React.FC = () => {
  return (
    <div className={styles.appLayout}>
      <div className={styles.dragRegion} />
      <Sidebar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className={styles.layout}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route element={<AppLayout />}>
            <Route path="/workspace" element={<WorkspacePage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </div>
      <Toaster />
    </HashRouter>
  );
};

export default App;
