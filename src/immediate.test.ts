import { immediateReader, readFirstLines, readLastLines } from "./immediate";
import { LineReader } from "./LineReader";
import { FileHandle } from "node:fs/promises";
import { prepareFile } from "./testUtils/mockFsEnv";

const stubFile = {} as FileHandle;

describe('immediateReader', () => {
  function createLineReaderStub(lines: number) {
    const nextLine = jest.fn().mockResolvedValue('line');
    const LineReaderStub = class implements LineReader {
      remainingLines = lines;
      close = () => Promise.resolve();
      hasNextLine = () => this.remainingLines > 0;
      nextLine = () => {
        this.remainingLines--;
        return nextLine();
      }
    };
    return { nextLine, LineReaderStub };
  }

  it('reads exact amount of lines', async () => {
    const { nextLine, LineReaderStub } = createLineReaderStub(10);

    const lines = await immediateReader(stubFile, LineReaderStub, 5);

    expect(lines).toHaveLength(5);
    expect(lines.every(line => line === 'line')).toBe(true);
    expect(nextLine).toHaveBeenCalledTimes(5);
  });

  it('reads less lines if there is not enough of them', async () => {
    const { nextLine, LineReaderStub } = createLineReaderStub(5);

    const lines = await immediateReader(stubFile, LineReaderStub, 10);

    expect(lines).toHaveLength(5);
    expect(lines.every(line => line === 'line')).toBe(true);
    expect(nextLine).toHaveBeenCalledTimes(5);
  });

  it('reads all lines if there is exact amount of them', async () => {
    const { nextLine, LineReaderStub } = createLineReaderStub(5);

    const lines = await immediateReader(stubFile, LineReaderStub, 5);

    expect(lines).toHaveLength(5);
    expect(lines.every(line => line === 'line')).toBe(true);
    expect(nextLine).toHaveBeenCalledTimes(5);
  });
});

describe('readFirstLines', () => {
  it('reads first lines', async () => {
    const { file, lines } = await prepareFile({ lineLength: 10, lineCount: 10 });

    const result = await readFirstLines(file, 5);

    expect(result).toStrictEqual(lines.slice(0, 5));
  });
});

describe('readLastLines', () => {
  it('reads last lines', async () => {
    const { file, lines } = await prepareFile({ lineLength: 10, lineCount: 10 });

    const result = await readLastLines(file, 5);

    expect(result).toStrictEqual(lines.slice(5, 10).reverse());
  });
});
