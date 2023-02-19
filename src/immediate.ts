import { LineReader } from "./LineReader";
import { FileHandle } from "node:fs/promises";
import { constructLineReader } from "./constructLineReader";
import { ForwardLineReader } from "./ForwardLineReader";
import { BackwardLineReader } from "./BackwardLineReader";

export async function immediateReader(
  file: string | FileHandle,
  LineReaderConstructable: { new(fileHandle: FileHandle): LineReader },
  count: number
): Promise<string[]> {
  const reader = await constructLineReader(file, LineReaderConstructable);

  const lines: string[] = [];
  for(let i = 0; i < count && reader.hasNextLine(); i++) {
    lines.push(await reader.nextLine());
  }
  await reader.close();

  return lines;
}

export function readFirstLines(file: string | FileHandle, count: number): Promise<string[]> {
  return immediateReader(file, ForwardLineReader, count);
}


export function readLastLines(file: string | FileHandle, count: number): Promise<string[]> {
  return immediateReader(file, BackwardLineReader, count);
}
