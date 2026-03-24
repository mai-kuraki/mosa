import React from "react";
import { HashRouter, Routes, Route, Outlet } from "react-router-dom";
import HomePage from "./routes/home";
import LibraryPage from "./routes/library";
import EditorPage from "./routes/editor";
import BatchPage from "./routes/batch";
import SettingsPage from "./routes/settings";
import TitleBar from "./components/shared/TitleBar";
import Sidebar from "./components/shared/Sidebar";
import styles from "./App.module.less";

const AppLayout: React.FC = () => {
  return (
    <>
      <TitleBar />
      <div className={styles.content}>
        <Sidebar />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className={styles.layout}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route element={<AppLayout />}>
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/editor/:imageId?" element={<EditorPage />} />
            <Route path="/batch" element={<BatchPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;
