import { LineReader } from "./LineReader";
import { FileHandle } from "node:fs/promises";
import { constructLineReader } from "./constructLineReader";
import { ForwardLineReader } from "./ForwardLineReader";
import { BackwardLineReader } from "./BackwardLineReader";

interface ImmediateReaderOptions {
  ignoreEmptyLines?: boolean;
}

export async function immediateReader(
  file: string | FileHandle,
  LineReaderConstructable: { new(fileHandle: FileHandle): LineReader },
  count: number,
  options: ImmediateReaderOptions = {}
): Promise<string[]> {
  const { ignoreEmptyLines } = options;

  const reader = await constructLineReader(file, LineReaderConstructable);

  const lines: string[] = [];
  while (lines.length < count && reader.hasNextLine()) {
    const line = await reader.nextLine();
    if (!ignoreEmptyLines || line) {
      lines.push(line);
    }
  }
  await reader.close();

  return lines;
}

export function readFirstLines(file: string | FileHandle, count: number, options?: ImmediateReaderOptions): Promise<string[]> {
  return immediateReader(file, ForwardLineReader, count, options);
}


export function readLastLines(file: string | FileHandle, count: number, options?: ImmediateReaderOptions): Promise<string[]> {
  return immediateReader(file, BackwardLineReader, count, options);
}
