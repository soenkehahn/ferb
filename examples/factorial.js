#!/usr/bin/env jsi

function wait(n: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, n * 1000);
  });
}

function factorial(n: number): number {
  if (n <= 0) {
    return 1;
  } else {
    return n * factorial(n - 1);
  }
}

async function main() {
  let i = 0;
  while (i <= 6) {
    console.log(`factorial(${i}) = ${factorial(i)}`);
    await wait(0.5);
    i++;
  }
}

main();
