/***
 *  a mix between throttle and debounce
 *
 *  if not called in the last ms
 *     call immediately
 *  else
 *    if not scheduled, schedule
 *    else ignore
 */
export const throttle = (fn: (...whatever: any[]) => void, ms: number) => {
  let state = 0; // 0 == run now, 1 == schedule in ms, 2 ignore
  return function (...args: any[]) {
    if (state === 0) {
      state++;
      fn(...args);
      window.setTimeout(() => state--, ms);
    } else if (state == 1) {
      state += 2;
      window.setTimeout(() => {
        state--;
        fn(...args);
        window.setTimeout(() => state--, ms);
      }, ms);
    }
  };
};

export function debounce(timems: number, callback: (...whatever: any[]) => void) {
  let nextCall: number | null = null;
  const f = (...whatever: any[]) => {
    if (nextCall !== null) {
      clearTimeout(nextCall);
    }
    nextCall = window.setTimeout(() => callback(...whatever), timems);
  };
  f.immediately=(...whatever: any[])=>{
    if (nextCall !== null) {
      clearTimeout(nextCall);
    }
    callback(...whatever)
  }
  return f;
}

// type HasKeys<O> = {
//   [P in keyof O]: O[P] extends (first: any, ...args: infer H) => any
//     ? (...args: H) => HasKeys<O>
//     : never;
// };

// export function ChainOperators<T, O>(ops: O) {
//   return {
//     with: (start: T, chain: (arg: HasKeys<O>) => HasKeys<O>) => {
//       let curr = start;
//       const proxy: any = {};
//       for (const prop of Object.keys(ops)) {
//         // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
//         proxy[prop] = (...args: any[]) => {
//           // eslint-disable-next-line
//           curr = (ops as any)[prop](curr, ...args)
//           // eslint-disable-next-line @typescript-eslint/no-unsafe-return
//           return proxy;
//         };
//       }
//       chain(proxy);
//       return curr;
//     },
//   };
// }

// type FunctionTypedRet<T> = (...args: any[]) => T;

// export class DaisyChainer<T> {
//   ops: FunctionTypedRet<T>[] = [];
//   constructor(protected start: T, ops?: FunctionTypedRet<T>[]) {
//     if (ops) this.ops = ops;
//   }
//   then(this: DaisyChainer<T>, op: FunctionTypedRet<T>): DaisyChainer<T> {
//     return new DaisyChainer<T>(this.start, this.ops.concat([op]));
//   }
//   return(): T {
//     let v: T = this.start;
//     for (const op of this.ops) v = op(v);
//     return v;
//   }
// }
