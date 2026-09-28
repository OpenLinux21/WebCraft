/** Plain code file triple shared by exercises, the editor and the preview. */
export interface CodeFiles {
  html: string;
  css: string;
  js: string;
}

export interface ExerciseFiles {
  starter: CodeFiles;
  solution: CodeFiles;
}
