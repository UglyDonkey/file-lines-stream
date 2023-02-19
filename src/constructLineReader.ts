import { FileHandle, open } from "node:fs/promises";
import { LineReader } from "./LineReader";

export async function constructLineReader(
  file: string | FileHandle,
  LineReaderConstructable: { new(fileHandle: FileHandle): LineReader }
): Promise<LineReader> {
  const fileHandle = typeof file === 'string' ? await open(file) : file;
  return new LineReaderConstructable(fileHandle);
}