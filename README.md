`jsi` is an interpreter for modern, babel-transpiled, flow-type-checked
javascript. Here's an example for how `jsi` can be used:

```js
#!/usr/bin/env jsi

const x: number = 42;
console.log(x);
```

## How to install

You need `docker`.

`./install.sh $PREFIX`

This will put the `jsi` executable into `$PREFIX/bin/`. (Default for `$PREFIX` is `/usr/local`.)

To actually run `jsi` to execute scripts, you need have `node` and `yarn` installed.

## How to run the tests

### Dependencies

* `node-9.5.0`
* `yarn`
* `go-1.8`
* `upx`

### Running the tests

`yarn install && flow && ./slow-tests.sh`

### Running the tests faster

During development, you can run the tests with `jest` (and `jest --watch`), but
this will not clear `~/.jsi` between tests. So the tests will not be properly
isolated.
