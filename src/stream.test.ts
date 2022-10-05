import { prepareFile, setupMockFsEnv } from './testUtils/mockFsEnv';
import { createBackwardReadStream, createForwardReadStream, createReadStream } from './stream';
import { pipeline, Writable } from 'stream';
import { FileHandle } from 'node:fs/promises';
import { LineReader } from './LineReader';

const stubFile = {} as FileHandle;

describe('createReadStream', () => {
  it('reads one line', async () => {
    const LineReaderStub = class implements LineReader {
      calls = 0
      nextLine() { this.calls++; return Promise.resolve('line'); }
      hasNextLine() { return this.calls < 1; }
      close = () => Promise.resolve();
    };
    const readable = await createReadStream(stubFile, LineReaderStub);

    const result: string[] = [];
    await new Promise(resolve => pipeline(readable, new Writable({
      objectMode: true,
      write (line, _, cb) {
        result.push(line);
        cb();
      }
    }), resolve));

    expect(result).toStrictEqual(['line']);
  });

  it('emits error from nextLine', async () => {
    const stubError = new Error('stub');
    const LineReaderStub = class implements LineReader {
      nextLine(): Promise<string> { return Promise.reject(stubError); }
      hasNextLine = () => true
      close = () => Promise.resolve()
    };
    const readable = await createReadStream(stubFile, LineReaderStub);

    const error = await new Promise(resolve => pipeline(readable, new Writable({
      objectMode: true,
      write: ({}, {}, cb) => cb()
    }), resolve));

    expect(error).toBe(stubError);
  });

  it('emits error from hasNextLine', async () => {
    const stubError = new Error('stub');
    const LineReaderStub = class implements LineReader {
      nextLine = () => Promise.resolve('line')
      hasNextLine = () => { throw stubError }
      close = () => Promise.resolve()
    };
    const readable = await createReadStream(stubFile, LineReaderStub);

    const error = await new Promise(resolve => pipeline(readable, new Writable({
      objectMode: true,
      write: ({}, {}, cb) => cb()
    }), resolve));

    expect(error).toBe(stubError);
  });

  it('emits error from close', async () => {
    const stubError = new Error('stub');
    const LineReaderStub = class implements LineReader {
      nextLine = () => Promise.resolve('line')
      hasNextLine = () => false
      close = () => Promise.reject(stubError);
    };
    const readable = await createReadStream(stubFile, LineReaderStub);

    const error = await new Promise(resolve => pipeline(readable, new Writable({
      objectMode: true,
      write: ({}, {}, cb) => cb()
    }), resolve));

    expect(error).toBe(stubError);
  });
})

describe('createForwardStream', () => {
  setupMockFsEnv();

  it('reads all lines and close file', async () => {
    const {file, lines} = await prepareFile({lineLength: 10, lineCount: 10});

    const readable = await createForwardReadStream(file);

    const dataListener = jest.fn();
    readable.on('data', dataListener);

    const result: string[] = [];
    await new Promise(resolve => pipeline(readable, new Writable({
      objectMode: true,
      write (line, _, cb) {
        result.push(line);
        cb();
      }
    }), resolve));

    expect(result).toStrictEqual(lines);
    expect(dataListener).toBeCalledTimes(10);
    expect(await file.read().catch(e => e)).toMatchObject({ message: 'file closed' });
  });

  it('close file if stream is closed before all lines were consumed', async () => {
    const {file} = await prepareFile({lineLength: 10, lineCount: 10});

    const readable = await createForwardReadStream(file);

    const dataListener = jest.fn();
    readable.on('data', dataListener);

    await new Promise(resolve => pipeline(readable, new Writable({
      objectMode: true,
      write (line, _, cb) {
        this.destroy();
        cb();
      }
    }), resolve));

    expect(dataListener).toBeCalledTimes(1);
    expect(await file.read().catch(e => e)).toMatchObject({ message: 'file closed' });
  });
});

describe('createBackwardStream', () => {
  setupMockFsEnv();

  it('reads all lines and close file', async () => {
    const {file, lines} = await prepareFile({lineLength: 10, lineCount: 10});

    const readable = await createBackwardReadStream(file);

    const dataListener = jest.fn();
    readable.on('data', dataListener);

    const result: string[] = [];
    await new Promise(resolve => pipeline(readable, new Writable({
      objectMode: true,
      write (line, _, cb) {
        result.push(line);
        cb();
      }
    }), resolve));

    expect(result).toStrictEqual(lines.reverse());
    expect(dataListener).toBeCalledTimes(10);
    expect(await file.read().catch(e => e)).toMatchObject({ message: 'file closed' });
  });
});
