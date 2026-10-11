"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectMenuProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  className?: string;
  placeholder?: string;
}

export function SelectMenu({
  options,
  value,
  onChange,
  ariaLabel,
  className,
  placeholder = "Select…",
}: SelectMenuProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(
      0,
      options.findIndex((option) => option.value === value),
    ),
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function commit(index: number) {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setOpen(false);
  }

  function handleButtonKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setActiveIndex((prev) => {
        const next = event.key === "ArrowDown" ? prev + 1 : prev - 1;
        return Math.min(Math.max(next, 0), options.length - 1);
      });
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) commit(activeIndex);
      else setOpen(true);
    }
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleButtonKeyDown}
        className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-border bg-background/60 pl-3 pr-2.5 text-sm text-foreground transition-colors hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        <span>{selected ? selected.label : placeholder}</span>
        <svg
          viewBox="0 0 24 24"
          className={cn(
            "h-4 w-4 text-muted transition-transform duration-200",
            open && "rotate-180",
          )}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute right-0 z-50 mt-2 max-h-72 min-w-full overflow-auto rounded-xl border border-border bg-background/95 p-1.5 shadow-xl shadow-black/10 backdrop-blur-md"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => commit(index)}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    index === activeIndex
                      ? "bg-primary/10 text-foreground"
                      : "text-muted hover:bg-primary/10 hover:text-foreground",
                    isSelected && "font-semibold text-primary",
                  )}
                >
                  <span>{option.label}</span>
                  {isSelected && (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4 text-primary"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      aria-hidden
                    >
                      <path d="m5 13 4 4L19 7" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
