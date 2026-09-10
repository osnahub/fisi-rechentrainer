"use client";

import React, { useRef, KeyboardEvent } from "react";

export interface TabItem<T extends string> {
  id: T;
  label: string;
  fullLabel?: string;
  detail?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

interface ModeTabsProps<T extends string> {
  tabs: readonly TabItem<T>[] | TabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  ariaLabel: string;
  size?: "sm" | "md";
  className?: string;
  panelIdPrefix?: string;
}

export function ModeTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  ariaLabel,
  size = "md",
  className = "",
  panelIdPrefix,
}: ModeTabsProps<T>) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = tabs.findIndex((t) => t.id === activeTab);
    if (currentIndex === -1) return;

    let nextIndex = -1;

    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        nextIndex = (currentIndex + 1) % tabs.length;
        break;
      case "ArrowLeft":
        e.preventDefault();
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        break;
      case "Home":
        e.preventDefault();
        nextIndex = 0;
        break;
      case "End":
        e.preventDefault();
        nextIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    if (nextIndex !== -1) {
      onChange(tabs[nextIndex].id);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  const isSmall = size === "sm";

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={`flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory ${className}`}
    >
      {tabs.map((tab, idx) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[idx] = el;
            }}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={panelIdPrefix && isActive ? `${panelIdPrefix}-${tab.id}` : undefined}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={`snap-start flex items-center justify-center gap-1.5 rounded-2xl font-medium transition-all cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${
              isSmall ? "px-2.5 sm:px-3 py-1.5 text-xs" : "px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm"
            } ${
              isActive
                ? "bg-[var(--primary-btn-bg)] text-white border-[var(--primary-btn-bg)] font-semibold shadow-md"
                : "border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)]"
            }`}
          >
            {Icon && (
              <Icon
                size={isSmall ? 14 : 16}
                className={isActive ? "text-white" : "text-sky-700 dark:text-sky-400"}
              />
            )}
            <span className={tab.fullLabel ? "inline sm:hidden" : ""}>{tab.label}</span>
            {tab.fullLabel && <span className="hidden sm:inline">{tab.fullLabel}</span>}
            {tab.detail && <span className="text-[10px] opacity-85 ml-1 hidden xs:inline">{tab.detail}</span>}
          </button>
        );
      })}
    </div>
  );
}
