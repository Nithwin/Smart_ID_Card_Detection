"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  Camera,
  AlertTriangle,
  UserPlus,
  Shield,
} from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/detect", label: "Detect Image", icon: Upload },
  { href: "/camera", label: "Live Camera", icon: Camera },
  { href: "/alerts", label: "Alerts", icon: AlertTriangle },
  { href: "/faces", label: "Face Registry", icon: UserPlus },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-gray-800 bg-gray-950 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-gray-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-sm text-white leading-tight">Smart ID Card</h1>
          <p className="text-[11px] text-gray-500">Detection System</p>
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
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800 text-[11px] text-gray-600">
        CA-YOLOv8 + InsightFace
      </div>
    </aside>
  );
}
