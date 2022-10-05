export interface LineReader {
  nextLine(): Promise<string>;
  hasNextLine(): boolean;
  close(): Promise<void>;
}
