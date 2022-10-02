import mockFs from 'mock-fs';
import { open } from 'node:fs/promises';
import { ForwardLineReader } from './ForwardLineReader';

describe('ForwardLineReader', () => {
  beforeEach(() => mockFs());
  afterEach(() => mockFs.restore());

  async function prepareFile(options: { lineLength: number, lineCount: number }) {
    const fileName = 'file.txt';

    const { lineLength, lineCount } = options;
    const lines = Array.from({ length: lineCount }, () =>
      Array.from({ length: lineLength }, () => Math.floor(Math.random() * 34).toString(34)).join('')
    );

    mockFs({ [fileName]: lines.join('\n') });

    return {
      lines,
      file: await open(fileName)
    }
  }

  it('reads small file', async () => {
    const { lines, file } = await prepareFile({ lineLength: 4, lineCount: 4 });

    const reader = new ForwardLineReader(file);

    for (const line of lines) {
      expect(await reader.nextLine()).toEqual(line);
    }
    expect(await reader.nextLine()).toEqual('');
  });

  it('reads file bigger than buffer size', async () => {
    const { lines, file } = await prepareFile({ lineLength: 4, lineCount: 512 });

    const reader = new ForwardLineReader(file);

    for (const line of lines) {
      expect(await reader.nextLine()).toEqual(line);
    }
    expect(await reader.nextLine()).toEqual('');
  });

  it('reads file with lines bigger than buffer size', async () => {
    const { lines, file } = await prepareFile({ lineLength: 1500, lineCount: 4 });

    const reader = new ForwardLineReader(file);

    for (const line of lines) {
      expect(await reader.nextLine()).toEqual(line);
    }
    expect(await reader.nextLine()).toEqual('');
  });
});
