import { LineReader } from './LineReader';
import { FileHandle } from 'node:fs/promises';

export class ForwardLineReader implements LineReader {
  constructor(private file?: FileHandle) {}

  private buffer: string[] = [];

  async nextLine(): Promise<string> {
    let line: string = this.buffer.shift() || '';
    while(!this.buffer.length && this.file) {
      const { buffer, bytesRead } = await this.file.read({ length: 1024 });
      this.buffer = buffer.subarray(0, bytesRead).toString().split('\n');
      line += this.buffer.shift();

      if(bytesRead < 1024) {
        this.close();
        break;
      }
    }
    return line;
  }

  hasNextLine(): boolean {
    return !!(this.file || this.buffer.length);
  }

  async close() {
    const closePromise = this.file?.close();
    this.file = undefined;

    await closePromise;
  }
}
