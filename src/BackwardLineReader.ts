import { LineReader } from './LineReader';
import { FileHandle } from 'node:fs/promises';

export class BackwardLineReader implements LineReader {
  constructor(private file: FileHandle) {}

  private buffer: string[] = [];
  private position?: number;

  async nextLine(): Promise<string> {
    if(this.position === undefined) {
      const fileStat = await this.file.stat();
      this.position = fileStat.size;
    }

    let line: string = this.buffer.pop() || '';
    while(!this.buffer.length) {
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
        break;
      }
    }
    return line;
  }
}
