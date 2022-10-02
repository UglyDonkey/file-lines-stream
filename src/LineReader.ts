export interface LineReader {
  nextLine(): Promise<string>;
  hasNextLine(): boolean;
}
