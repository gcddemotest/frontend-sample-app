import { Container, HttpServer, Scope } from "@msiviero/knit";
import * as supertest from "supertest";
import { Api } from "../src/api/api";
import { Service } from "../src/service/service";

describe("Http server custom instance", () => {

  const container = new Container()
    .register(Api, Scope.Singleton)
    .register(Service, Scope.Singleton);

  const httpServer = new HttpServer(container)
    .api(Api);

  beforeAll(() => httpServer.start({ port: 0 }));
  afterAll(() => httpServer.stop());

  it("should register endpoint and serve requests", async () => {

    await supertest(httpServer.getServer())
      .get("/")
      .expect(200)
      .expect("Content-Type", "text/plain; charset=utf-8");
  });
});
