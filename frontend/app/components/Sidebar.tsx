"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  Upload,
  Film,
  Camera,
  AlertTriangle,
  UserPlus,
  Network,
  Menu,
  X,
  Moon,
  Sun
} from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/detect", label: "Detect Image", icon: Upload },
  { href: "/detect-video", label: "Detect Video", icon: Film },
  { href: "/camera", label: "Live Camera", icon: Camera },
  { href: "/alerts", label: "Alerts", icon: AlertTriangle },
  { href: "/faces", label: "Face Registry", icon: UserPlus },
  { href: "/yolo-architecture", label: "CA-YOLOv8 Logic", icon: Network },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const navContent = (
    <div className="h-full flex flex-col">
      <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
          <Image src="/logo.svg" alt="Smart ID Logo" width={30} height={30} className="object-contain" />
        </div>
        <div>
          <h1 className="font-semibold text-sm leading-tight text-slate-900 dark:text-white">Smart ID Card</h1>
          <p className="text-[11px] text-slate-500">Detection Console</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/70"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 flex flex-col gap-3">
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition text-slate-700 dark:text-slate-200 font-medium flex items-center justify-center gap-2"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        )}
        <div className="text-center">CA-YOLOv8 + InsightFace</div>
      </div>
    </div>
  );

  return (
    <>
      <header className="md:hidden sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Smart ID Logo" width={26} height={26} className="object-contain" />
          <span className="font-semibold text-sm text-slate-900 dark:text-white">Smart ID</span>
        </div>
        <button onClick={() => setOpen((prev) => !prev)} className="p-2 rounded-md border border-slate-200 dark:border-slate-700">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      <aside className="hidden md:block fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700">
        {navContent}
      </aside>

      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)}>
          <aside
            className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
