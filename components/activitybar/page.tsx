"use client";
import React, { useState } from "react";
import { House, Boxes, Layers } from "lucide-react";

const tabs = [
  { id: 'Home', icon: House, label: 'Home' },
  { id: 'workspace', icon: Layers, label: 'Workspace' },
  { id: 'workbox', icon: Boxes, label: 'WorkBox' },
] as const;

type ActivityTabId = (typeof tabs)[number]['id'];

export default function ActivityBar() {
  const [activeTab, setActiveTab] = useState<ActivityTabId>('workspace');
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  const onTabSelect = (tabId: ActivityTabId) => {
    setActiveTab(tabId);
  };

  const onTerminalToggle = () => {
    setIsTerminalOpen((open) => !open);
  };
  return (
    <div className="h-full w-12 bg-[#161616] border-r border-[#1f1f1f] flex flex-col items-center justify-between text-gray-300 py-2">
      <div className="flex flex-col items-center space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabSelect(tab.id)}
              className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors duration-150 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3c89ff] cursor-pointer ${
                isActive ? "text-white bg-[#383838]" : ""
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