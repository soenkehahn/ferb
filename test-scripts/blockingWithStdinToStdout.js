#!/usr/bin/env jsi

function relayStdin(): Promise<void> {
  return new Promise(resolve => {
    process.stdin.on("data", data => {
      console.log(data.toString());
    });
    process.stdin.on("end", data => {
      resolve();
    });
  });
}

async function main() {
  await relayStdin();
}

main();
