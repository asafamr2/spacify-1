import { Deferred } from "../helpers/Deferred";

export class Service<T> {
  protected _instance: T | undefined;
  protected constructor(protected ctor: { new (): T }) {}
  public static from<T>(cls: { new (): T }) {
    return new Service(cls);
  }
  getInstance = () => {
    if (!this._instance) this._instance = new this.ctor();
    return this._instance;
  };
}

export class AsyncService<
  T extends { ready(): Promise<void> },
  U 
> {
  protected _instanceDeferred: Deferred<T>;
  protected constructor(protected ctor: new (args: U) => T) {
    this._instanceDeferred = new Deferred<T>();
  }
  public static from<T extends { ready(): Promise<void> },U>(
    cls: new (args: U) => T
  ) {
    return new AsyncService<T, U>(cls);
  }
  public async build(args: U) {
    const inst = new this.ctor(args);
    if (inst.ready) {
      await inst.ready();
    }
    this._instanceDeferred.resolve(inst);
  }
  public getAsyncInstance(): Promise<T> {
    return this._instanceDeferred.promise;
  }
}

export type ServiceType<T> =  T extends  AsyncService<infer Y, any> ? Y : T extends Service<infer Y>? Y:never;

// export class AsyncService {
//   protected ready_to_serve(this: AsyncService) {
//     const pending = Object.getPrototypeOf(this)
//       ?._instanceDeffered as Deferred<unknown>;
//     if (pending !== undefined) {
//       pending.resolve(this);
//     } else {
//       let newDef = new Deferred<any>();
//       newDef.resolve(this);
//       Object.getPrototypeOf(this)._instanceDeffered = newDef;
//     }
//   }

//   public static getAsyncService<T>(this: Function & { prototype: T }) {
//     if (!this.prototype._instanceDeffered) {
//       this.prototype._instanceDeffered = new Deferred<T>();
//     }
//     return this.prototype._instanceDeffered.promise as Promise<T>;
//   }
// }
