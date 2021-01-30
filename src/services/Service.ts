/* eslint-disable */
export abstract class Service {
  public static getService<T>(this: new (...args: any[]) => T) {
    if (!this.prototype._instance) this.prototype._instance = new this();
    return this.prototype._instance as T;
  }
}

export abstract class AsyncService {
    constructor(waitTo?:Promise<void>) {
      if(!waitTo){
        waitTo=Promise.resolve();
      }
    if(Object.getPrototypeOf(this)._instancePromise){
      // someones waiting for service already
      void waitTo.then(Object.getPrototypeOf(this)._instanceReadyCB(this))
    }
    else{
      Object.getPrototypeOf(this)._instancePromise = waitTo.then(()=>this)
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public static getService<T>(this: Function & { prototype: T }) {
    if (!this.prototype._instancePromise) {
      this.prototype._instancePromise = new Promise((resolve) => {
        this.prototype._instanceReadyCB = resolve;
      });
    }
    return this.prototype._instancePromise as Promise<T>;
  }
}
