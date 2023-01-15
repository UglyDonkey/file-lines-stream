import { prepareFile, setupMockFsEnv } from './testUtils/mockFsEnv';
import { FileHandle } from 'node:fs/promises';
import { LineReader } from './LineReader';
import {createBackwardReadableStream, createForwardReadableStream, createReadableStream} from "./WebStream";

const stubFile = {} as FileHandle;

describe('createReadableStream', () => {
  it('reads one line', async () => {
    const LineReaderStub = class implements LineReader {
      calls = 0
      nextLine() { this.calls++; return Promise.resolve('line'); }
      hasNextLine() { return this.calls < 1; }
      close = () => Promise.resolve();
    };
    const readable = await createReadableStream(stubFile, LineReaderStub);

    const result: string[] = [];
    await readable.pipeTo(new WritableStream({ write: line => {result.push(line)}}));

    expect(result).toStrictEqual(['line']);
  });

  it('emits error from nextLine', async () => {
    const stubError = new Error('stub');
    const LineReaderStub = class implements LineReader {
      nextLine(): Promise<string> { return Promise.reject(stubError); }
      hasNextLine = () => true
      close = () => Promise.resolve()
    };
    const readable = await createReadableStream(stubFile, LineReaderStub);
    const abort = jest.fn();

    const error = await readable.pipeTo(new WritableStream({ abort })).catch(e => e);

    expect(error).toBe(stubError);
    expect(abort).toBeCalledWith(stubError);
  });

  it('emits error from hasNextLine', async () => {
    const stubError = new Error('stub');
    const LineReaderStub = class implements LineReader {
      nextLine = () => Promise.resolve('line')
      hasNextLine = () => { throw stubError }
      close = () => Promise.resolve()
    };
    const readable = await createReadableStream(stubFile, LineReaderStub);
    const abort = jest.fn();

    const error = await readable.pipeTo(new WritableStream({ abort })).catch(e => e);

    expect(error).toBe(stubError);
    expect(abort).toBeCalledWith(stubError);
  });

  it('emits error from close', async () => {
    const stubError = new Error('stub');
    const LineReaderStub = class implements LineReader {
      nextLine = () => Promise.resolve('line')
      hasNextLine = () => false
      close = () => Promise.reject(stubError);
    };
    const readable = await createReadableStream(stubFile, LineReaderStub);
    const abort = jest.fn();

    const error = await readable.pipeTo(new WritableStream({ abort })).catch(e => e);

    expect(error).toBe(stubError);
    expect(abort).toBeCalledWith(stubError);
  });
})

describe('createForwardStream', () => {
  setupMockFsEnv();

  it('reads all lines and close file', async () => {
    const {file, lines} = await prepareFile({lineLength: 10, lineCount: 10});

    const readable = await createForwardReadableStream(file);

    const result: string[] = [];
    await readable.pipeTo(new WritableStream({ write: line => {result.push(line)}}));

    expect(result).toStrictEqual(lines);
    expect(await file.read().catch(e => e)).toMatchObject({ message: 'file closed' });
  });

  it('close file if stream is closed before all lines were consumed', async () => {
    const {file} = await prepareFile({lineLength: 10, lineCount: 10});

    const readable = await createForwardReadableStream(file);

    await readable.pipeTo(new WritableStream({ write: () => Promise.reject()})).catch(e => e);

    expect(await file.read().catch(e => e)).toMatchObject({ message: 'file closed' });
  });
});

describe('createBackwardStream', () => {
  setupMockFsEnv();

  it('reads all lines and close file', async () => {
    const {file, lines} = await prepareFile({lineLength: 10, lineCount: 10});

    const readable = await createBackwardReadableStream(file);

    const result: string[] = [];
    await readable.pipeTo(new WritableStream({ write: line => {result.push(line)}}));

    expect(result).toStrictEqual(lines.reverse());
    expect(await file.read().catch(e => e)).toMatchObject({ message: 'file closed' });
  });
});
