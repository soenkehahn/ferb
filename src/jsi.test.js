// @flow

import { execSync, spawnSync } from "child_process";
import { writeFileSync } from "fs";
import temporary from "temporary";

type Outcome = {
  stdout: string,
  stderr: string,
  exitCode: number
};

function withTempDir<A>(action: string => A): A {
  const tempDir = new temporary.Dir();
  let a;
  try {
    a = action(tempDir.path);
  } finally {
    execSync("rm *", { cwd: tempDir.path });
  }
  return a;
}

function run(program: string): Outcome {
  return withTempDir(tempDir => {
    const file = "test_foo.js";
    writeFileSync(tempDir + "/" + file, program);
    execSync("chmod +x " + file, { cwd: tempDir });
    const jsiPath = process.cwd() + "/dist/bin";
    if (process.env["PATH"]) {
      process.env["PATH"] = jsiPath + ":" + process.env["PATH"];
    }
    const result = spawnSync("jsi", ["./" + file], {
      cwd: tempDir,
      env: process.env
    });
    const output = {
      stdout: result.stdout.toString(),
      stderr: result.stderr.toString(),
      exitCode: result.status
    };
    console.error(output);
    return output;
  });
}

beforeAll(() => {
  execSync("./build.sh");
});

beforeEach(() => {
  if (process.env["CLEAR_CACHE"]) {
    spawnSync("flow stop", { cwd: "~/.jsi/project" });
    execSync("rm ~/.jsi -rf");
  }
});

describe("jsi executable", () => {
  it("allows to run a hello-world program", () => {
    const outcome = run(`#!/usr/bin/env jsi
console.log('hello world');
    `);
    expect(outcome.stdout).toBe("hello world\n");
  });

  it("returns a zero exit code", () => {
    const outcome = run(`#!/usr/bin/env jsi
console.log('hello world');
    `);
    expect(outcome.exitCode).toBe(0);
  });

  it("returns a non-zero exit code when throwing an exception", () => {
    const outcome = run(`#!/usr/bin/env jsi
throw new Error('foo');
    `);
    expect(outcome.exitCode).toBe(1);
  });

  it("includes strings written to stderr in stderr output", () => {
    const outcome = run(`#!/usr/bin/env jsi
console.error('error output');
    `);
    expect(outcome.stderr).toContain("error output\n");
  });

  describe("flow", () => {
    it("allows type annotations", () => {
      const outcome = run(`#!/usr/bin/env jsi
const x: number = 42;
console.log('foo');
    `);
      expect(outcome.exitCode).toBe(0);
      expect(outcome.stdout).toBe("foo\n");
    });

    xit("does not output anything to stderr when cache is warm", () => {
      run(`#!/usr/bin/env jsi
  console.error('error output');
      `);
      const outcome = run(`#!/usr/bin/env jsi
  console.error('error output');
      `);
      expect(outcome.stderr).toBe("error output\n");
    });

    describe("when there's type errors", () => {
      it("outputs the type error to stderr", () => {
        const outcome = run(`#!/usr/bin/env jsi
const x: string = 42;
      `);
        expect(outcome.stderr).toContain(
          "number. This type is incompatible with"
        );
        expect(outcome.stderr).toContain("string");
      });

      it("relays flow's exit code", () => {
        const outcome = run(`#!/usr/bin/env jsi
const x: string = 42;
      `);
        expect(outcome.exitCode).toBe(2);
      });

      it("does not run the script", () => {
        const outcome = run(`#!/usr/bin/env jsi
const x: string = 42;
console.log('foo');
      `);
        expect(outcome.stdout).not.toBe("foo\n");
      });
    });
  });

  describe("babel", () => {
    it("allows import statements", () => {
      const outcome = run(`#!/usr/bin/env jsi
import { execSync } from 'child_process';
console.log(execSync('echo foo').toString());
      `);
      expect(outcome.stdout).toBe("foo\n\n");
    });
  });
});
