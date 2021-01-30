import "ts-jest";

import { AsyncService } from "./Service";

class A extends AsyncService {
  public somethin = "aaa";
  public constructor(s: string) {
    super();
    this.somethin = s;
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
}

it("ddd", async () => {
  const aProm = A.getService();
  new A("sdsd");
  const d = await aProm;

  console.log(d.somethin);

const sss= await A.getService()
  console.log(sss.somethin);

});
