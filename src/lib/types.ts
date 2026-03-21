export interface Language {
  id: string;
  label: string;
  monaco: string;
  piston: string;
  version: string;
  template: string;
}

export const LANGUAGES: Language[] = [
  {
    id: "python",
    label: "Python",
    monaco: "python",
    piston: "python",
    version: "3.10.0",
    template: `# Python Example
print("Hello, World!")

# Try a simple calculation
numbers = [1, 2, 3, 4, 5]
total = sum(numbers)
print(f"Sum of {numbers} = {total}")
`,
  },
  {
    id: "javascript",
    label: "JavaScript",
    monaco: "javascript",
    piston: "javascript",
    version: "18.15.0",
    template: `// JavaScript Example
console.log("Hello, World!");

// Try a simple calculation
const numbers = [1, 2, 3, 4, 5];
const total = numbers.reduce((a, b) => a + b, 0);
console.log(\`Sum of [\${numbers}] = \${total}\`);
`,
  },
  {
    id: "java",
    label: "Java",
    monaco: "java",
    piston: "java",
    version: "15.0.2",
    template: `// Java Example
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        int[] numbers = {1, 2, 3, 4, 5};
        int total = 0;
        for (int n : numbers) total += n;
        System.out.println("Sum = " + total);
    }
}
`,
  },
  {
    id: "c",
    label: "C",
    monaco: "c",
    piston: "c",
    version: "10.2.0",
    template: `// C Example
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    
    int numbers[] = {1, 2, 3, 4, 5};
    int total = 0;
    for (int i = 0; i < 5; i++) total += numbers[i];
    printf("Sum = %d\\n", total);
    
    return 0;
}
`,
  },
];

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  signal: string | null;
}

export interface CodeHistoryEntry {
  id: string;
  language: string;
  code: string;
  output: string;
  success: boolean;
  timestamp: Date;
}

export interface AIAnalysis {
  errorExplanation: string;
  correctedCode: string;
  errorLine?: number;
}
