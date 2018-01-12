// @flow

import { execSync, spawnSync } from "child_process";
import { writeFileSync } from "fs";
import temporary from "temporary";

type Outcome = {
  stdout: string
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
    const ferbPath = process.cwd() + "/dist/bin";
    if (process.env["PATH"]) {
      process.env["PATH"] = ferbPath + ":" + process.env["PATH"];
    }
    const result = execSync("./" + file, {
      cwd: tempDir,
      env: process.env
    });
    const stdout = result.toString();
    return {
      stdout: stdout
    };
  });
}

describe("ferb executable", () => {
  it("allows to run a hello-world program", () => {
    const outcome = run(`#!/usr/bin/env ferb
console.log('hello world');
    `);
    expect(outcome.stdout).toBe("hello world\n");
  });
});
