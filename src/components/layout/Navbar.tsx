import { Bell, Moon, Search, User } from "lucide-react";

type NavbarProps = {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
};

export default function Navbar({
  onToggleTheme,
  searchQuery,
  onSearchChange,
}: NavbarProps){
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-8">
      <div className="flex items-center gap-8">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          ⚽ GamePlan
        </h1>

        <div className="relative hidden lg:block">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={searchQuery}
            onChange={(event) =>
              onSearchChange(event.target.value)
            }
            placeholder="Search tasks..."
            className="w-80 rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition-all duration-300 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white">
          <Bell size={21} />
        </button>

        <button
          onClick={onToggleTheme}
          className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          <Moon size={21} />
        </button>

        <div className="flex items-center gap-3 rounded-xl bg-slate-900 px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600">
            <User
              size={17}
              className="text-white"
            />
          </div>

          <div className="hidden md:block">
            <p className="text-sm font-semibold text-white">
              Manan Patel
            </p>

            <p className="text-xs text-slate-400">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}