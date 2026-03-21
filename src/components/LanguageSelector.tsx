import { LANGUAGES, Language } from "@/lib/types";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LanguageSelectorProps {
  selected: Language;
  onSelect: (lang: Language) => void;
}

const LanguageSelector = ({ selected, onSelect }: LanguageSelectorProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-muted"
      >
        <span className="font-mono">{selected.label}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-50 mt-1 min-w-[160px] overflow-hidden rounded-md border border-border bg-popover shadow-lg"
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                onClick={() => {
                  onSelect(lang);
                  setOpen(false);
                }}
                className={`flex w-full items-center px-3 py-2 text-sm font-mono transition-colors hover:bg-secondary ${
                  lang.id === selected.id ? "bg-secondary text-primary" : "text-popover-foreground"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSelector;
