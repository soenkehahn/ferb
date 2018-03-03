#!/usr/bin/env jsi

import fs from "fs";

const unblockFile = process.env["UNBLOCK_FILE"];
if (!unblockFile) {
  throw "UNBLOCK_FILE not set";
}

function waitForUnblockFile(): Promise<void> {
  return new Promise(resolve => {
    function loop() {
      if (fs.existsSync(unblockFile)) {
        resolve();
      } else {
        setTimeout(loop, 10);
      }
    }
    loop();
  });
}

async function main() {
  console.error("starting");
  await waitForUnblockFile();
  console.error("stopping");
}

main();
