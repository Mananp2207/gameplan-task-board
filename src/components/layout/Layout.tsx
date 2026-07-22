import type { ReactNode } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

type LayoutProps = {
  children: ReactNode;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
};

export default function Layout({
  children,
  isDarkMode,
  onToggleTheme,
  searchQuery,
  onSearchChange,
}: LayoutProps) {
  return (
    <div
      className={`flex h-screen overflow-hidden ${
        isDarkMode
          ? "bg-slate-950"
          : "bg-slate-100"
      }`}
    >
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          isDarkMode={isDarkMode}
          onToggleTheme={onToggleTheme}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />

        <main
          className={`flex-1 overflow-y-auto p-8 transition-colors duration-300 ${
            isDarkMode
              ? "bg-slate-950"
              : "bg-slate-100"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}