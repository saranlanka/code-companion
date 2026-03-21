import { useRef, useCallback } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (value: string) => void;
  errorLine?: number;
}

const CodeEditor = ({ code, language, onChange, errorLine }: CodeEditorProps) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<editor.IEditorDecorationsCollection | null>(null);

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const highlightError = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    if (decorationsRef.current) {
      decorationsRef.current.clear();
    }

    if (errorLine && errorLine > 0) {
      decorationsRef.current = editor.createDecorationsCollection([
        {
          range: {
            startLineNumber: errorLine,
            startColumn: 1,
            endLineNumber: errorLine,
            endColumn: 1,
          },
          options: {
            isWholeLine: true,
            className: "error-line-decoration",
            glyphMarginClassName: "error-glyph",
            linesDecorationsClassName: "error-line-border",
          },
        },
      ]);

      editor.revealLineInCenter(errorLine);
    }
  }, [errorLine]);

  // Apply error highlighting when errorLine changes
  if (editorRef.current && errorLine) {
    highlightError();
  }

  return (
    <div className="h-full w-full overflow-hidden rounded-md border border-border">
      <Editor
        height="100%"
        language={language}
        value={code}
        onChange={(v) => onChange(v || "")}
        onMount={handleMount}
        theme="vs-dark"
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', monospace",
          minimap: { enabled: false },
          padding: { top: 16, bottom: 16 },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          renderLineHighlight: "all",
          bracketPairColorization: { enabled: true },
          automaticLayout: true,
          wordWrap: "on",
          lineNumbers: "on",
          folding: true,
          suggest: { showMethods: true, showFunctions: true },
        }}
      />
      <style>{`
        .error-line-decoration {
          background-color: rgba(255, 0, 0, 0.15) !important;
        }
        .error-line-border {
          background: hsl(0 72% 51%);
          width: 3px !important;
          margin-left: 3px;
        }
      `}</style>
    </div>
  );
};

export default CodeEditor;
