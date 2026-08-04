/* eslint-disable @typescript-eslint/no-require-imports */
export {};

const { TextDecoder, TextEncoder } = require('node:util');
const { ReadableStream, TransformStream } = require('node:stream/web');
const {
  BroadcastChannel,
  MessageChannel,
  MessagePort,
} = require('node:worker_threads');

Object.assign(globalThis, {
  TextDecoder,
  TextEncoder,
  ReadableStream,
  TransformStream,
  BroadcastChannel,
  MessageChannel,
  MessagePort,
});

const { fetch, Headers, FormData, Request, Response } = require('undici');

Object.assign(globalThis, {
  fetch,
  Headers,
  FormData,
  Request,
  Response,
});

if (typeof URL.createObjectURL !== 'function') {
  URL.createObjectURL = () => 'blob:mock-url';
}
if (typeof URL.revokeObjectURL !== 'function') {
  URL.revokeObjectURL = () => {};
}
