import { Readable } from 'node:stream';
import { ForwardLineReader } from './ForwardLineReader';
import { FileHandle, open } from 'node:fs/promises';
import { LineReader } from './LineReader';
import { BackwardLineReader } from './BackwardLineReader';

export async function createReadStream(
  file: string | FileHandle,
  LineReaderConstructable: { new(fileHandle: FileHandle): LineReader }
): Promise<Readable> {
  const fileHandle = typeof file === 'string' ? await open(file) : file;

  const reader = new LineReaderConstructable(fileHandle);

  return new Readable({
    objectMode: true,
    read() {
      reader.nextLine().then(line => {
        this.push(line);
        if (!reader.hasNextLine()) {
          this.destroy();
        }
      }).catch(e => this.destroy(e));
    },
    destroy(error, callback) {
      reader.close()
        .then(() => callback(error))
        .catch(callback);
    }
  });
}

export function createForwardReadStream(file: string | FileHandle): Promise<Readable> {
  return createReadStream(file, ForwardLineReader);
}

export function createBackwardReadStream(file: string | FileHandle): Promise<Readable> {
  return createReadStream(file, BackwardLineReader);
}
