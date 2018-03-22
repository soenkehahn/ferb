// @flow

import { execSync, spawn, type ChildProcess } from "child_process";
import { writeFileSync } from "fs";

export function syncStream(stream: stream$Readable): Promise<string> {
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

export function runAsync(
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

export type Outcome = {|
  stdout: string,
  stderr: string,
  exitCode: number,
  scriptFile: string
|};

export async function runSync(
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

declare var fail: string => void;

export function expectToBeSuccessful(outcome: Outcome) {
  if (outcome.exitCode === 0) {
  } else {
    fail(
      [
        `expected exit code to be 0, received ${outcome.exitCode}.`,
        "stderr:",
        outcome.stderr
      ].join("\n")
    );
  }
}
