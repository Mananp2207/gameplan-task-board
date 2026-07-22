// import {
//   LayoutDashboard,
//   ClipboardList,
//   Calendar,
//   BarChart3,
//   Settings,
// } from "lucide-react";
// import { NavLink } from "react-router-dom";

// const topMenu = [
//   {
//     title: "Dashboard",
//     icon: LayoutDashboard,
//     path: "/",
//   },
//   {
//     title: "Tasks",
//     icon: ClipboardList,
//     path: "/tasks",
//   },
// ];

// const bottomMenu = [
//   {
//     title: "Calendar",
//     icon: Calendar,
//     path: "/calendar",
//   },
//   {
//     title: "Analytics",
//     icon: BarChart3,
//     path: "/analytics",
//   },
//   {
//     title: "Settings",
//     icon: Settings,
//     path: "/settings",
//   },
// ];

// export default function Sidebar() {
//   return (
//     <aside className="flex h-screen w-64 flex-col justify-between border-r border-slate-800 bg-slate-950">
//       <div>
//         <div className="border-b border-slate-800 p-6">
//           <h2 className="text-2xl font-bold text-white">
//             ⚽ GamePlan
//           </h2>

//           <p className="mt-2 text-sm text-slate-400">
//             Sports Operations Platform
//           </p>
//         </div>

//         <nav className="space-y-2 p-4">
//           {topMenu.map((item) => {
//             const Icon = item.icon;

//             return (
//               <NavLink
//                 key={item.title}
//                 to={item.path}
//                 className={({ isActive }) =>
//                   `flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition ${
//                     isActive
//                       ? "bg-blue-600 text-white shadow-lg"
//                       : "text-slate-300 hover:bg-slate-800 hover:text-white"
//                   }`
//                 }
//               >
//                 <Icon size={20} />

//                 <span>{item.title}</span>
//               </NavLink>
//             );
//           })}
//         </nav>
//       </div>

//       <div className="border-t border-slate-800 p-4">
//         <nav className="space-y-2">
//           {bottomMenu.map((item) => {
//             const Icon = item.icon;

//             return (
//               <NavLink
//                 key={item.title}
//                 to={item.path}
//                 className={({ isActive }) =>
//                   `flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition ${
//                     isActive
//                       ? "bg-blue-600 text-white shadow-lg"
//                       : "text-slate-300 hover:bg-slate-800 hover:text-white"
//                   }`
//                 }
//               >
//                 <Icon size={20} />

//                 <span>{item.title}</span>
//               </NavLink>
//             );
//           })}
//         </nav>
//       </div>
//     </aside>
//   );
// }



import {
  BarChart3,
  Calendar,
  CheckCircle,
  ClipboardList,
  Eye,
  LayoutDashboard,
  PlayCircle,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const topMenu = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    title: "To Do",
    icon: ClipboardList,
    path: "/tasks/todo",
  },
  {
    title: "In Progress",
    icon: PlayCircle,
    path: "/tasks/inprogress",
  },
  {
    title: "In Review",
    icon: Eye,
    path: "/tasks/inreview",
  },
  {
    title: "Completed",
    icon: CheckCircle,
    path: "/tasks/done",
  },
];

const bottomMenu = [
  {
    title: "Calendar",
    icon: Calendar,
    path: "/calendar",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    path: "/analytics",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

function getLinkClass(isActive: boolean) {
  return `flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition ${
    isActive
      ? "bg-blue-600 text-white shadow-lg"
      : "text-slate-300 hover:bg-slate-800 hover:text-white"
  }`;
}

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col justify-between border-r border-slate-800 bg-slate-950">
      <div>
        <div className="border-b border-slate-800 p-6">
          <h2 className="text-2xl font-bold text-white">
            ⚽ GamePlan
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Sports Operations Platform
          </p>
        </div>

        <nav className="space-y-2 p-4">
          {topMenu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.title}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  getLinkClass(isActive)
                }
              >
                <Icon size={20} />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <nav className="space-y-2 border-t border-slate-800 p-4">
        {bottomMenu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.title}
              to={item.path}
              className={({ isActive }) =>
                getLinkClass(isActive)
              }
            >
              <Icon size={20} />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}