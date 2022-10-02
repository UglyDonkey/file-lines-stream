import { BackwardLineReader } from './BackwardLineReader';
import { prepareFile, setupMockFsEnv } from './testUtils/mockFsEnv';
import { expectLineReader } from './testUtils/expectLineReader';

describe('BackwardLineReader', () => {
  setupMockFsEnv();

  it('reads small file', async () => {
    const { lines, file } = await prepareFile({ lineLength: 4, lineCount: 4 });

    const reader = new BackwardLineReader(file);

    await expectLineReader(reader).toReturn(lines.reverse());
  });

  it('reads file bigger than buffer size', async () => {
    const { lines, file } = await prepareFile({ lineLength: 13, lineCount: 256 });

    const reader = new BackwardLineReader(file);

    await expectLineReader(reader).toReturn(lines.reverse());
  });

  it('reads file with lines bigger than buffer size', async () => {
    const { lines, file } = await prepareFile({ lineLength: 1500, lineCount: 4 });

    const reader = new BackwardLineReader(file);

    await expectLineReader(reader).toReturn(lines.reverse());
  });

  it('reads empty lines', async () => {
    const { lines, file } = await prepareFile({ lineLength: 0, lineCount: 1500 });

    const reader = new BackwardLineReader(file);

    await expectLineReader(reader).toReturn(lines);
  });

  it('reads empty file', async () => {
    const { file } = await prepareFile({ lineLength: 0, lineCount: 0 });

    const reader = new BackwardLineReader(file);

    await expectLineReader(reader).toReturn(['']);
  });
});
