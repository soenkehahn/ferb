`jsi` is an interpreter for modern, babel-transpiled, flow-type-checked
javascript. Here's an example for how `jsi` can be used:

```js
#!/usr/bin/env jsi

const x: number = 42;
console.log(x);
```

## How to install

You need `go` and `upx`. Then run

`./install.sh $PREFIX`

This will put the `jsi` executable into `$PREFIX/bin/`. (Default for `$PREFIX` is `/usr/local`.)

To actually run `jsi` to execute scripts, you need have `node` and `yarn` installed.

## How to run the tests

You need `node` and `yarn`. Then run

`yarn && flow && ./slow-tests.sh`
