import { spawn, type SpawnOptionsWithoutStdio } from "node:child_process";
import type { Readable } from "node:stream";

interface R<T> {
  readonly child: {
    readonly code: number | null;
    readonly signal: NodeJS.Signals | null;
  };
  readonly stdout: T;
  readonly stderr: T;
}

export class CaptureResult<T> {
  public readonly child: R<T>["child"];
  public readonly stdout: T;
  public readonly stderr: T;

  constructor(data: R<T>) {
    this.child = data.child;
    this.stdout = data.stdout;
    this.stderr = data.stderr;
  }

  get succeeded(): boolean {
    return !this.child.code && !this.child.signal;
  }

  public assertSuccess(): this {
    if (!this.succeeded) throw new FailedCaptureResult<T>(this);
    return this;
  }
}

export class FailedCaptureResult<T> extends Error {
  constructor(public readonly captureResult: CaptureResult<T>) {
    super("Command failed");
  }
}

type CaptureResultString = CaptureResult<string>;

export class CaptureResultBuffer extends CaptureResult<Buffer> {
  constructor(data: R<Buffer>) {
    super(data);
  }

  public decode(encoding: BufferEncoding): CaptureResultString {
    return new CaptureResult({
      ...this,
      stdout: this.stdout.toString(encoding),
      stderr: this.stderr.toString(encoding),
    });
  }
}

const readableAsBuffer = (readable: Readable): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    let b = Buffer.of();
    // readable.setEncoding("binary");
    readable.on("data", (chunk) => (b = Buffer.concat([b, chunk])));
    readable.on("end", () => resolve(b));
    readable.on("error", (error) => reject(error));
  });

export default (
  command: string,
  args: readonly string[],
  options: SpawnOptionsWithoutStdio & { stdinData: Buffer }
): Promise<CaptureResultBuffer> => {
  const childResult = Promise.withResolvers<CaptureResultBuffer["child"]>();

  const child = spawn(command, args, {
    ...options,
    stdio: "pipe",
  });
  child.on("error", (error) => childResult.reject(error));
  child.on("close", (code, signal) => childResult.resolve({ code, signal }));

  child.stdin.write(options.stdinData);
  child.stdin.end();

  return Promise.all([
    childResult.promise,
    readableAsBuffer(child.stdout),
    readableAsBuffer(child.stderr),
  ]).then(
    ([child, stdout, stderr]) =>
      new CaptureResultBuffer({
        child,
        stdout,
        stderr,
      })
  );
};
