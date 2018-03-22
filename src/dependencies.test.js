// @flow

import { execSync, spawnSync } from "child_process";
import tmp from "tmp";
import { runSync, type Outcome, expectToBeSuccessful } from "./test-utils.js";

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

beforeAll(() => {
  execSync("./build/build.sh");
});

beforeEach(() => {
  if (process.env["CLEAR_CACHE"]) {
    spawnSync("flow stop", { cwd: "~/.jsi/project" });
    execSync("rm -rf ~/.jsi/project/node_modules/*");
    execSync("rm -rf ~/.jsi");
  }
});

jest.setTimeout(40000);

describe("jsi executable", () => {
  it("allows to use recouple", async () => {
    const outcome = await runSync(
      testTempDir,
      `#!/usr/bin/env jsi
      import * as Recouple from "recouple";
      const testEndpoint: Recouple.Endpoint<{}, string> = Recouple.endpoint()
        .fragment("foo");`
    );
    expectToBeSuccessful(outcome);
  });

  it("allows to use recouple-fetch", async () => {
    const outcome = await runSync(
      testTempDir,
      `#!/usr/bin/env jsi
      import * as RecoupleFetch from "recouple-fetch";
      console.log(typeof RecoupleFetch.safeGet);`
    );
    expectToBeSuccessful(outcome);
  });
});
