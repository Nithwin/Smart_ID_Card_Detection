"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  Camera,
  AlertTriangle,
  UserPlus
} from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/detect", label: "Detect Image", icon: Upload },
  { href: "/camera", label: "Live Camera", icon: Camera },
  { href: "/alerts", label: "Alerts", icon: AlertTriangle },
  { href: "/faces", label: "Face Registry", icon: UserPlus },
  { href: "/nn-training", label: "NN 3D Visuals", icon: LayoutDashboard },
  { href: "/yolo-architecture", label: "CA-YOLOv8 Logic", icon: LayoutDashboard },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-950 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden">
          <Image src="/logo.png" alt="Smart ID Logo" width={32} height={32} className="object-contain" />
        </div>
        <div>
          <h1 className="font-bold text-sm text-white leading-tight">Smart ID Card</h1>
          <p className="text-[11px] text-slate-500">Detection System</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-600/10 text-blue-400"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer & Theme Options */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 bg-slate-950/50 flex flex-col gap-3">
        <button 
           onClick={() => {
              if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light'); // Custom classes usually toggle dark
              } else {
                document.documentElement.classList.add('dark');
                document.documentElement.classList.remove('light');
              }
           }}
           className="w-full py-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition text-slate-300 font-medium flex items-center justify-center gap-2"
        >
          Toggle Light/Dark Theme
        </button>
        <div className="text-center">CA-YOLOv8 + InsightFace System</div>
      </div>
    </aside>
  );
}
