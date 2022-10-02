import { LineReader } from '../LineReader';

export function expectLineReader(reader: LineReader) {
  return {
    async toReturn(lines: string[]) {
      for (const line of lines) {
        expect(await reader.nextLine()).toEqual(line);
      }
      expect(await reader.nextLine()).toEqual('');
    }
  }
}
