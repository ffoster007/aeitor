"use client";
import React from "react";
import { House, Boxes } from "lucide-react";

const tabs = [
  { id: 'Home', icon: House, label: 'Home' },
  { id: 'Workspace', icon: Boxes, label: 'Workspace' },
] as const;

export type ActivityTabId = (typeof tabs)[number]['id'];

interface ActivityBarProps {
  activeTab: ActivityTabId;
  onTabSelect: (tabId: ActivityTabId) => void;
}

export default function ActivityBar({ activeTab, onTabSelect }: ActivityBarProps) {
  return (
    <div className="h-full w-12 bg-[var(--sidebar-bg)] border-r border-[var(--border)] flex flex-col items-center justify-between text-[var(--text-muted)] py-2">
      <div className="flex flex-col items-center space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabSelect(tab.id)}
              className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors duration-150 hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] cursor-pointer ${
                isActive ? "text-[var(--text-primary)] bg-[var(--surface-3)]" : ""
              }`}
              title={tab.label}
              aria-label={tab.label}
              aria-pressed={isActive}
              type="button"
            >
              <Icon size={20} strokeWidth={1.75} />
            </button>
          );
        })}
      </div>
    </div>
  );
}