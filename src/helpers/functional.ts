/***
 *  if not called in the last ms
 *     call immediately
 *  if called in the last ms
 *    if not scheduled, scheduled
 *    else ignore
 */ // eslint-disable-next-line @typescript-eslint/ban-types
export const throttle = (fn: Function, ms: number) => {
  let state = 0; // 0 == run now, 1 == schedule in ms, 2 ignore
  return function (...args: any[]) {
    if (state === 0) {
      state++;
      fn.apply(this, args);
      window.setTimeout(() => state--, ms);
    } else if (state == 1) {
      state+=2;
      window.setTimeout(() => {
        state--;
        fn.apply(this, args);
        window.setTimeout(() => state--, ms);
      }, ms);
    }
  };
};
