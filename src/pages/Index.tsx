import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Download, History, Terminal } from "lucide-react";
import CodeEditor from "@/components/CodeEditor";
import LanguageSelector from "@/components/LanguageSelector";
import OutputPanel from "@/components/OutputPanel";
import HistoryPanel from "@/components/HistoryPanel";
import { LANGUAGES, Language, CodeHistoryEntry, AIAnalysis } from "@/lib/types";
import { executeCode } from "@/lib/piston";
import { toast } from "sonner";

const Index = () => {
  const [language, setLanguage] = useState<Language>(LANGUAGES[0]);
  const [code, setCode] = useState(LANGUAGES[0].template);
  const [stdout, setStdout] = useState("");
  const [stderr, setStderr] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [errorLine, setErrorLine] = useState<number | undefined>();
  const [history, setHistory] = useState<CodeHistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setCode(lang.template);
    setStdout("");
    setStderr("");
    setHasRun(false);
    setErrorLine(undefined);
    setAiAnalysis(null);
  };

  const parseErrorLine = (stderr: string, lang: string): number | undefined => {
    const patterns: Record<string, RegExp> = {
      python: /line (\d+)/i,
      javascript: /:(\d+):/,
      java: /\.java:(\d+)/,
      c: /:(\d+):\d+:/,
    };
    const match = stderr.match(patterns[lang] || /line (\d+)/i);
    return match ? parseInt(match[1]) : undefined;
  };

  const analyzeError = useCallback(
    async (errorCode: string, errorMsg: string, lang: string) => {
      setIsAnalyzing(true);
      try {
        // Simple client-side AI-like analysis (pattern matching for common errors)
        const analysis = generateErrorAnalysis(errorCode, errorMsg, lang);
        setAiAnalysis(analysis);
      } catch {
        toast.error("Could not analyze the error");
      } finally {
        setIsAnalyzing(false);
      }
    },
    []
  );

  const runCode = async () => {
    setIsRunning(true);
    setHasRun(true);
    setStdout("");
    setStderr("");
    setErrorLine(undefined);
    setAiAnalysis(null);

    try {
      const result = await executeCode(language.piston, language.version, code);
      setStdout(result.stdout);
      setStderr(result.stderr);

      const isError = result.stderr.length > 0;

      if (isError) {
        const line = parseErrorLine(result.stderr, language.id);
        setErrorLine(line);
        analyzeError(code, result.stderr, language.id);
      }

      // Add to history
      setHistory((prev) => [
        {
          id: crypto.randomUUID(),
          language: language.label,
          code,
          output: isError ? result.stderr : result.stdout,
          success: !isError,
          timestamp: new Date(),
        },
        ...prev.slice(0, 19),
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Execution failed";
      setStderr(msg);
      toast.error(msg);
    } finally {
      setIsRunning(false);
    }
  };

  const handleApplyFix = (fixedCode: string) => {
    setCode(fixedCode);
    setErrorLine(undefined);
    setAiAnalysis(null);
    toast.success("Fix applied! Click Run to test it.");
  };

  const downloadCode = () => {
    const extensions: Record<string, string> = {
      python: "py", javascript: "js", java: "java", c: "c",
    };
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${extensions[language.id] || "txt"}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Code downloaded!");
  };

  const handleHistorySelect = (entry: CodeHistoryEntry) => {
    const lang = LANGUAGES.find((l) => l.label === entry.language);
    if (lang) {
      setLanguage(lang);
      setCode(entry.code);
      setHistoryOpen(false);
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Top Bar */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between border-b border-border px-4 py-2 md:px-6"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            <h1 className="text-base font-bold text-foreground md:text-lg">
              Code<span className="text-primary">Runner</span>
            </h1>
          </div>
          <LanguageSelector selected={language} onSelect={handleLanguageChange} />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary"
          >
            <History className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">History</span>
          </button>
          <button
            onClick={downloadCode}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={runCode}
            disabled={isRunning}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            {isRunning ? "Running..." : "Run Code"}
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="relative flex flex-1 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1 flex flex-col md:flex-row overflow-hidden"
        >
          {/* Editor */}
          <div className="h-1/2 md:h-full md:w-1/2 p-2">
            <CodeEditor
              code={code}
              language={language.monaco}
              onChange={setCode}
              errorLine={errorLine}
            />
          </div>

          {/* Output */}
          <div className="h-1/2 md:h-full md:w-1/2 p-2">
            <OutputPanel
              stdout={stdout}
              stderr={stderr}
              isRunning={isRunning}
              hasRun={hasRun}
              aiAnalysis={aiAnalysis}
              isAnalyzing={isAnalyzing}
              onApplyFix={handleApplyFix}
            />
          </div>
        </motion.div>

        {/* History Sidebar */}
        <HistoryPanel
          entries={history}
          onSelect={handleHistorySelect}
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
        />
      </div>
    </div>
  );
};

export default Index;

// Simple error analysis engine (pattern-based)
function generateErrorAnalysis(code: string, error: string, lang: string): AIAnalysis {
  const lines = code.split("\n");
  let explanation = "";
  let correctedCode = code;
  let errorLine: number | undefined;

  // Python errors
  if (lang === "python") {
    if (error.includes("SyntaxError")) {
      const match = error.match(/line (\d+)/);
      errorLine = match ? parseInt(match[1]) : undefined;
      if (error.includes("EOL while scanning string")) {
        explanation = "You have an unclosed string. Make sure all quotes are properly paired.";
        if (errorLine) {
          const line = lines[errorLine - 1];
          const singleQuotes = (line.match(/'/g) || []).length;
          const doubleQuotes = (line.match(/"/g) || []).length;
          if (singleQuotes % 2 !== 0) correctedCode = code.replace(lines[errorLine - 1], line + "'");
          else if (doubleQuotes % 2 !== 0) correctedCode = code.replace(lines[errorLine - 1], line + '"');
        }
      } else if (error.includes("invalid syntax")) {
        explanation = "There's a syntax error in your code. Check for missing colons, parentheses, or incorrect indentation.";
      } else {
        explanation = "Your code has a syntax issue. Review the line mentioned in the error for typos or missing characters.";
      }
    } else if (error.includes("NameError")) {
      const varMatch = error.match(/name '(\w+)' is not defined/);
      explanation = varMatch
        ? `The variable '${varMatch[1]}' is not defined. Make sure you've declared it before using it, or check for typos.`
        : "You're trying to use a variable that hasn't been defined yet.";
    } else if (error.includes("TypeError")) {
      explanation = "You're trying to perform an operation on incompatible types. Check that you're using the right data types.";
    } else if (error.includes("IndentationError")) {
      explanation = "Your code has an indentation problem. Python uses indentation to define code blocks. Make sure your indentation is consistent.";
    } else {
      explanation = "An error occurred while running your code. Review the error message above for details.";
    }
  }
  // JavaScript errors
  else if (lang === "javascript") {
    if (error.includes("SyntaxError")) {
      explanation = "There's a syntax error in your JavaScript code. Check for missing brackets, semicolons, or typos.";
    } else if (error.includes("ReferenceError")) {
      const varMatch = error.match(/(\w+) is not defined/);
      explanation = varMatch
        ? `'${varMatch[1]}' is not defined. Make sure you've declared it with let, const, or var.`
        : "You're referencing something that doesn't exist.";
    } else if (error.includes("TypeError")) {
      explanation = "You're trying to use a value in a way that's not allowed. Check that your variables have the expected types.";
    } else {
      explanation = "An error occurred. Review the error message for details on what went wrong.";
    }
  }
  // Java errors
  else if (lang === "java") {
    if (error.includes("error:")) {
      explanation = "Your Java code has a compilation error. Check the error message for the specific issue and line number.";
    } else if (error.includes("Exception")) {
      explanation = "A runtime exception occurred. Check for null values, array bounds, or type casting issues.";
    } else {
      explanation = "An error occurred in your Java code. Review the error details above.";
    }
  }
  // C errors
  else if (lang === "c") {
    if (error.includes("error:")) {
      explanation = "Your C code has a compilation error. Common issues include missing semicolons, undeclared variables, or incorrect function signatures.";
    } else if (error.includes("warning:")) {
      explanation = "Your code compiled with warnings. While it may run, consider fixing the warnings for safer code.";
    } else {
      explanation = "An error occurred in your C code. Review the compiler output above.";
    }
  } else {
    explanation = "An error occurred. Review the error message above for details.";
  }

  return { errorExplanation: explanation, correctedCode, errorLine };
}
