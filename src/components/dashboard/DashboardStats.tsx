type DashboardStatsProps = {
  todoTasks: number;
  urgentTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  isDarkMode: boolean;
};

export default function DashboardStats({
  todoTasks,
  urgentTasks,
  inProgressTasks,
  completedTasks,
  isDarkMode,
}: DashboardStatsProps) {
  const cards = [
    {
      title: "To Do",
      subtitle: "Ready to start",
      value: todoTasks,
      icon: "📋",
      light: "bg-slate-50 border-slate-200",
      dark: "bg-slate-800 border-slate-700",
    },
    {
      title: "Urgent",
      subtitle: "Needs attention",
      value: urgentTasks,
      icon: "🚨",
      light: "bg-red-50 border-red-200",
      dark: "bg-red-950/40 border-red-900",
    },
    {
      title: "In Progress",
      subtitle: "Currently active",
      value: inProgressTasks,
      icon: "🚀",
      light: "bg-blue-50 border-blue-200",
      dark: "bg-blue-950/40 border-blue-900",
    },
    {
      title: "Completed",
      subtitle: "Finished work",
      value: completedTasks,
      icon: "✅",
      light: "bg-green-50 border-green-200",
      dark: "bg-green-950/40 border-green-900",
    },
  ];

  return (
    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.title}
          className={`rounded-3xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:scale-[1.03] hover:shadow-xl ${
            isDarkMode ? card.dark : card.light
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/70 text-3xl shadow-sm">
              {card.icon}
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                isDarkMode
                  ? "bg-slate-700 text-slate-300"
                  : "bg-white text-slate-500"
              }`}
            >
              {card.title}
            </span>
          </div>

          <h2
            className={`mt-8 text-5xl font-extrabold tracking-tight ${
              isDarkMode
                ? "text-white"
                : "text-slate-900"
            }`}
          >
            {card.value}
          </h2>

          <p
            className={`mt-3 text-base font-medium ${
              isDarkMode
                ? "text-slate-400"
                : "text-slate-500"
            }`}
          >
            {card.subtitle}
          </p>
        </article>
      ))}
    </section>
  );
}