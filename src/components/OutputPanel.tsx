import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Lightbulb, Copy, Loader2 } from "lucide-react";
import { AIAnalysis } from "@/lib/types";
import { useState } from "react";
import { toast } from "sonner";

interface OutputPanelProps {
  stdout: string;
  stderr: string;
  isRunning: boolean;
  hasRun: boolean;
  aiAnalysis: AIAnalysis | null;
  isAnalyzing: boolean;
  onApplyFix: (code: string) => void;
}

const OutputPanel = ({
  stdout,
  stderr,
  isRunning,
  hasRun,
  aiAnalysis,
  isAnalyzing,
  onApplyFix,
}: OutputPanelProps) => {
  const [copied, setCopied] = useState(false);
  const isError = stderr.length > 0;

  const copyCode = () => {
    if (aiAnalysis?.correctedCode) {
      navigator.clipboard.writeText(aiAnalysis.correctedCode);
      setCopied(true);
      toast.success("Corrected code copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md border border-border bg-terminal">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-2">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-destructive/60" />
          <div className="h-3 w-3 rounded-full bg-warning/60" />
          <div className="h-3 w-3 rounded-full bg-success/60" />
        </div>
        <span className="ml-2 text-xs font-medium text-muted-foreground">Output</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        <AnimatePresence mode="wait">
          {isRunning ? (
            <motion.div
              key="running"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-primary"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Running code...</span>
            </motion.div>
          ) : !hasRun ? (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-muted-foreground"
            >
              Click "Run Code" to see output here...
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Success output */}
              {stdout && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-success">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Output</span>
                  </div>
                  <pre className="whitespace-pre-wrap text-foreground">{stdout}</pre>
                </div>
              )}

              {/* Error output */}
              {isError && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-destructive">
                    <XCircle className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Error</span>
                  </div>
                  <pre className="whitespace-pre-wrap text-destructive/80">{stderr}</pre>
                </div>
              )}

              {/* AI Analysis */}
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-primary"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs">AI is analyzing the error...</span>
                </motion.div>
              )}

              {aiAnalysis && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 rounded-lg border border-accent/30 bg-accent/5 p-4"
                >
                  {/* Explanation */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-accent">
                      <Lightbulb className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        What went wrong
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90 font-sans">
                      {aiAnalysis.errorExplanation}
                    </p>
                  </div>

                  {/* Corrected code */}
                  {aiAnalysis.correctedCode && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-success">
                          Corrected Code
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={copyCode}
                            className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground transition-colors hover:bg-muted"
                          >
                            <Copy className="h-3 w-3" />
                            {copied ? "Copied!" : "Copy"}
                          </button>
                          <button
                            onClick={() => onApplyFix(aiAnalysis.correctedCode)}
                            className="rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground transition-colors hover:bg-primary/90"
                          >
                            Apply Fix
                          </button>
                        </div>
                      </div>
                      <pre className="overflow-x-auto rounded-md bg-editor p-3 text-xs text-foreground">
                        {aiAnalysis.correctedCode}
                      </pre>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OutputPanel;
