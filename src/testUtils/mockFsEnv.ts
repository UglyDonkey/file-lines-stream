import { open, writeFile, mkdir, rm } from 'fs/promises';
import { randomUUID } from 'crypto';

const dirName = `./tmp/${randomUUID()}`;

export function setupMockFsEnv() {
  afterAll(() => rm(dirName, { recursive: true }));
}

export async function prepareFile(options: { lineLength: number, lineCount: number }) {
  const filePath = `${dirName}/file.txt`;

  const {lineLength, lineCount} = options;
  const lines = Array.from({length: lineCount}, () =>
    Array.from({length: lineLength}, () => Math.floor(Math.random() * 34).toString(34)).join('')
  );

  await mkdir(dirName, { recursive: true });
  await writeFile(filePath, lines.join('\n'));

  return {
    lines,
    file: await open(filePath)
  }
}
