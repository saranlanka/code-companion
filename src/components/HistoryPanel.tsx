import { CodeHistoryEntry } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { History, CheckCircle, XCircle, X } from "lucide-react";

interface HistoryPanelProps {
  entries: CodeHistoryEntry[];
  onSelect: (entry: CodeHistoryEntry) => void;
  open: boolean;
  onClose: () => void;
}

const HistoryPanel = ({ entries, onSelect, open, onClose }: HistoryPanelProps) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="absolute right-0 top-0 z-40 flex h-full w-72 flex-col border-l border-border bg-card shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-card-foreground">History</span>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            {entries.length === 0 ? (
              <p className="p-4 text-center text-xs text-muted-foreground">No history yet</p>
            ) : (
              entries.map((entry, i) => (
                <button
                  key={entry.id}
                  onClick={() => onSelect(entry)}
                  className="flex w-full items-start gap-3 border-b border-border/50 px-4 py-3 text-left transition-colors hover:bg-secondary"
                >
                  {entry.success ? (
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-primary">{entry.language}</span>
                      <span className="text-[10px] text-muted-foreground">
                        #{entries.length - i}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground font-mono">
                      {entry.code.split("\n")[0]}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HistoryPanel;
