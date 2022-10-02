export interface LineReader {
  nextLine(): Promise<string>;
}
