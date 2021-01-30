/* eslint-disable */
import * as chalk from "chalk";

declare global {
  interface Promise<T> {
    describeFailure(
      failMessage: string,
      addOriginalError?: boolean
    ): PromiseLike<T>;
  }
}

function monkeyPatchPromises() {
  //todo add runtime checks for extra safety?
  console.log(
    chalk.yellow(
      "Monkey Patching Promise - should happen only during compilation!"
    )
  );
  Promise.prototype.describeFailure = describeFailure;
}

function getErrorObject() {
  try {
    throw Error("");
  } catch (err) {
    return err;
  }
}

function describeFailure(
  this: Promise<unknown>,
  failMessage: string,
  addOriginalError = true
) {
  let lexicalStack = "";
  try {
    lexicalStack = getErrorObject().stack.split("\n").slice(3, 5).join("\n");
  } catch (e) {}

  return this.catch((err: unknown) => {
    let originalErr;
    if (addOriginalError) {
      if (!err) {
        originalErr = "";
      } else if (err instanceof Error) {
        originalErr = err?.stack ? err.stack : err.message;
      } else {
        originalErr = String(err);
      }
    }
    const messages = [chalk.red(failMessage)];
    if (originalErr) messages.push(originalErr);
    if (lexicalStack) messages.push(lexicalStack);

    return Promise.reject(messages.join("\n"));
  });
}

monkeyPatchPromises();
