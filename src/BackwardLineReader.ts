import { LineReader } from './LineReader';
import { FileHandle } from 'node:fs/promises';

export class BackwardLineReader implements LineReader {
  constructor(private file?: FileHandle) {}

  private buffer: string[] = [];
  private position?: number;

  async nextLine(): Promise<string> {
    if(this.position === undefined) {
      const fileStat = await this.file?.stat();
      this.position = fileStat?.size ?? 0;
    }

    let line: string = this.buffer.pop() || '';
    while(!this.buffer.length && this.file) {
      this.position -= 1024;
      let length = 1024;
      if(this.position < 0) {
        length += this.position;
        this.position = 0;
      }

      const { buffer } = await this.file.read({ buffer: Buffer.alloc(length), position: this.position });
      this.buffer = buffer.subarray(0, length).toString().split('\n');
      line = this.buffer.pop() + line;

      if(this.position <= 0) {
        this.close();
        break;
      }
    }
    return line;
  }

  hasNextLine(): boolean {
    return !!(this.buffer.length || this.position === undefined || this.position > 0);
  }

  async close() {
    const closePromise = this.file?.close();
    this.file = undefined;

    await closePromise;
  }
}
