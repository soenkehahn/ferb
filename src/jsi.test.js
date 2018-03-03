// @flow

import { execSync, spawn, spawnSync, type ChildProcess } from "child_process";
import { writeFileSync } from "fs";
import tmp from "tmp";

function syncStream(stream: stream$Readable): Promise<string> {
  return new Promise(resolve => {
    let result: string = "";
    stream.on("data", data => {
      result += data;
    });
    stream.on("end", () => {
      resolve(result);
    });
  });
}

function syncExitCode(command: ChildProcess): Promise<number> {
  return new Promise(resolve => {
    command.on("exit", (exitCode, signal) => {
      resolve(exitCode);
    });
  });
}

type ProcessPromises = {|
  stdout: Promise<string>,
  stderr: Promise<string>,
  exitCode: Promise<number>,
  scriptFile: string
|};

function runAsync(
  tempDir: string,
  program: string,
  args: Array<string> = []
): { process: ChildProcess, scriptFile: string } {
  const file = "test_foo.js";
  const absoluteFile = tempDir + "/" + file;
  writeFileSync(absoluteFile, program);
  execSync("chmod +x " + file, { cwd: tempDir });
  const jsiPath = process.cwd() + "/dist/bin";
  if (process.env["PATH"]) {
    process.env["PATH"] = jsiPath + ":" + process.env["PATH"];
  }
  const jsiProcess = spawn("jsi", ["./" + file].concat(args), {
    cwd: tempDir,
    env: process.env
  });
  return { process: jsiProcess, scriptFile: absoluteFile };
}

type Outcome = {|
  stdout: string,
  stderr: string,
  exitCode: number,
  scriptFile: string
|};

async function runSync(
  tempDir: string,
  program: string,
  args: Array<string> = []
): Promise<Outcome> {
  const jsiProcess = runAsync(tempDir, program, args);
  const stdoutPromise = syncStream(jsiProcess.process.stdout);
  const stderrPromise = syncStream(jsiProcess.process.stderr);
  const exitCodePromise = syncExitCode(jsiProcess.process);
  return {
    stdout: await stdoutPromise,
    stderr: await stderrPromise,
    exitCode: await exitCodePromise,
    scriptFile: jsiProcess.scriptFile
  };
}

jest.setTimeout(40000);

beforeAll(() => {
  execSync("./build.sh");
});

beforeEach(() => {
  if (process.env["CLEAR_CACHE"]) {
    spawnSync("flow stop", { cwd: "~/.jsi/project" });
    execSync("rm -rf ~/.jsi/project/node_modules/*");
    execSync("rm -rf ~/.jsi");
  }
});

let tempDirObject;
let testTempDir: string;
beforeEach(() => {
  tempDirObject = tmp.dirSync();
  testTempDir = tempDirObject.name;
});

afterEach(() => {
  execSync(`rm -rf ${tempDirObject.name}/*`, { cwd: "/tmp/" });
  tempDirObject.removeCallback();
});

describe("jsi executable", () => {
  it("allows to run a hello-world program", async () => {
    const outcome = await runSync(
      testTempDir,
      `#!/usr/bin/env jsi
console.log('hello world');
    `
    );
    expect(outcome.stdout).toBe("hello world\n");
  });

  it("returns a zero exit code", async () => {
    const outcome = await runSync(
      testTempDir,
      `#!/usr/bin/env jsi
console.log('hello world');
    `
    );
    expect(outcome.exitCode).toBe(0);
  });

  it("returns a non-zero exit code when throwing an exception", async () => {
    const outcome = await runSync(
      testTempDir,
      `#!/usr/bin/env jsi
throw new Error('foo');
    `
    );
    expect(outcome.exitCode).toBe(1);
  });

  it("relays the correct exit code from the script", async () => {
    const outcome = await runSync(
      testTempDir,
      `#!/usr/bin/env jsi
process.exit(42);
    `
    );
    expect(outcome.exitCode).toBe(42);
  });

  it("includes strings written to stderr in stderr output", async () => {
    const outcome = await runSync(
      testTempDir,
      `#!/usr/bin/env jsi
console.error('error output');
    `
    );
    expect(outcome.stderr).toContain("error output\n");
  });

  describe("command line arguments", () => {
    it("passes in a command line argument", async () => {
      const outcome = await runSync(
        testTempDir,
        `#!/usr/bin/env jsi
const arg = process.argv.splice(2)[0];
console.log(arg);
    `,
        ["foo"]
      );
      expect(outcome.stdout).toBe("foo\n");
    });

    it("passes in multiple command line arguments", async () => {
      const args = Array.from(Array(10).keys()).map(n => `n=${n}`);
      const outcome = await runSync(
        testTempDir,
        `#!/usr/bin/env jsi
const arg = process.argv.splice(2);
console.log(arg.join(' '));
    `,
        args
      );
      expect(outcome.stdout).toBe(args.join(" ") + "\n");
    });

    it("passes in the absolute path to the script file as the second argument", async () => {
      const outcome = await runSync(
        testTempDir,
        `#!/usr/bin/env jsi
console.log(process.argv[1]);
    `
      );
      expect(outcome.stdout).toBe(outcome.scriptFile + "\n");
    });
  });

  describe("flow", () => {
    it("allows type annotations", async () => {
      const outcome = await runSync(
        testTempDir,
        `#!/usr/bin/env jsi
const x: number = 42;
console.log('foo');
    `
      );
      expect(outcome.exitCode).toBe(0);
      expect(outcome.stdout).toBe("foo\n");
    });

    it("does not output anything to stderr when cache is warm", async () => {
      await runSync(
        testTempDir,
        `#!/usr/bin/env jsi
  console.error('error output');
      `
      );
      const outcome = await runSync(
        testTempDir,
        `#!/usr/bin/env jsi
  console.error('error output');
      `
      );
      expect(outcome.stderr).toBe("error output\n");
    });

    describe("when there's type errors", () => {
      it("outputs the type error to stderr", async () => {
        const outcome = await runSync(
          testTempDir,
          `#!/usr/bin/env jsi
const x: string = 42;
      `
        );
        expect(outcome.stderr).toContain(
          "Cannot assign `42` to `x` because number [1] is incompatible with string [2]."
        );
        expect(outcome.stderr).toContain("string");
      });

      it("relays flow's exit code", async () => {
        const outcome = await runSync(
          testTempDir,
          `#!/usr/bin/env jsi
const x: string = 42;
      `
        );
        expect(outcome.exitCode).toBe(2);
      });

      it("does not run the script", async () => {
        const outcome = await runSync(
          testTempDir,
          `#!/usr/bin/env jsi
const x: string = 42;
console.log('foo');
      `
        );
        expect(outcome.stdout).not.toBe("foo\n");
      });
    });
  });

  describe("babel", () => {
    it("allows import statements", async () => {
      const outcome = await runSync(
        testTempDir,
        `#!/usr/bin/env jsi
import { execSync } from 'child_process';
console.log(execSync('echo foo').toString());
      `
      );
      expect(outcome.stdout).toBe("foo\n\n");
    });
  });
});
