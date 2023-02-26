import { constructLineReader } from "./constructLineReader";
import { LineReader } from "./LineReader";
import { FileHandle, open } from "node:fs/promises";

jest.mock('node:fs/promises', () => {
  return ({ open: jest.fn().mockResolvedValue({}) });
});
const openMock = open as jest.Mock;
afterEach(() => openMock.mockReset());

describe('constructLineReader', () => {
  const LineReaderStub = class implements LineReader {
    close(): Promise<void> {
      return Promise.resolve(undefined);
    }

    hasNextLine(): boolean {
      return false;
    }

    nextLine(): Promise<string> {
      return Promise.resolve("");
    }
  }

  it('opens file when path is provided', async () => {
    await constructLineReader('path', LineReaderStub);

    expect(openMock).toHaveBeenCalled();
  });

  it('uses file handle when it is provided', async () => {
    await constructLineReader({} as FileHandle, LineReaderStub);

    expect(openMock).not.toHaveBeenCalled();
  });
})