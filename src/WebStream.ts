import {FileHandle, open} from "node:fs/promises";
import {LineReader} from "./LineReader";
import {ForwardLineReader} from "./ForwardLineReader";
import {BackwardLineReader} from "./BackwardLineReader";

export async function createReadableStream(
  file: string | FileHandle,
  LineReaderConstructable: { new(fileHandle: FileHandle): LineReader },
  strategy?: QueuingStrategy<string>
): Promise<ReadableStream<string>> {
  const fileHandle = typeof file === 'string' ? await open(file) : file;

  const reader = new LineReaderConstructable(fileHandle);

  return new ReadableStream<string>({
    pull: async controller => {
      controller.enqueue(await reader.nextLine());

      if (!reader.hasNextLine()) {
        await reader.close();
        controller.close();
      }
    },
    cancel: () => reader.close()
  }, strategy);
}

export function createForwardReadableStream(file: string | FileHandle): Promise<ReadableStream<string>> {
  return createReadableStream(file, ForwardLineReader);
}

export function createBackwardReadableStream(file: string | FileHandle): Promise<ReadableStream<string>> {
  return createReadableStream(file, BackwardLineReader);
}
