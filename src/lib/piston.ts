import { ExecutionResult } from "./types";

const PISTON_API = "https://emkc.org/api/v2/piston";

export async function executeCode(
  language: string,
  version: string,
  code: string
): Promise<ExecutionResult> {
  const response = await fetch(`${PISTON_API}/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language,
      version,
      files: [{ content: code }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Execution failed: ${response.statusText}`);
  }

  const data = await response.json();
  const run = data.run;

  return {
    stdout: run.stdout || "",
    stderr: run.stderr || "",
    exitCode: run.code ?? 1,
    signal: run.signal || null,
  };
}
