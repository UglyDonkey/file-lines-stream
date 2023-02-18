# file-lines-stream
[![Version](https://img.shields.io/npm/v/file-lines-stream.svg)](https://npmjs.org/package/file-lines-stream)
[![License](https://img.shields.io/npm/l/file-lines-stream.svg)](https://github.com/oclif/file-lines-stream/blob/main/package.json)

This package allows to read files line by line in both directions. It supports node stream and WebStream API

## Basic usage

### WebStream API
```ts
import { createForwardReadableStream } from "file-lines-stream/WebStream";

const stream = await createForwardReadableStream('file.txt');
stream.pipeTo(new WritableStream({ write: line => console.log(line) }));
```
```ts
import { createBackwardReadableStream } from "file-lines-stream/WebStream";

const stream = await createBackwardReadableStream('file.txt');
stream.pipeTo(new WritableStream({ write: line => console.log(line) }));
```

### node stream
```ts
import { createForwardReadStream } from "file-lines-stream/stream";
import { Writable } from 'stream';

const stream = await createForwardReadStream('file.txt');
stream.pipe(new Writable({
  objectMode: true,
  write: (line, _, cb) => {
    console.log(line);
    cb();
  }
}));
```
```ts
import { createBackwardReadStream } from "file-lines-stream/stream";
import { Writable } from 'stream';

const stream = await createBackwardReadStream('file.txt');
stream.pipe(new Writable({
  objectMode: true,
  write: (line, _, cb) => {
    console.log(line);
    cb();
  }
}));
```
