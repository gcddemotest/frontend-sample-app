import { api, Exchange, HttpMethod, route } from "@msiviero/knit";
import axios from "axios";
import { hostname } from "os";

interface User {
  id: string;
  email: string;
  age: number;
}

interface Endpoint {
  address: string;
  port: string;
}

interface BlackboxServiceResponse {
  adult: boolean;
}

type ProcessedUser = User & BlackboxServiceResponse;

@api()
export class Api {

  @route(HttpMethod.GET, "/")
  public async health(exchange: Exchange) {
    exchange.response.code(200).send(`frontend-sample-app - ${hostname}`);
  }

  @route(HttpMethod.GET, "/process-users")
  public async getEndpoint(exchange: Exchange) {

    const backendApp: Readonly<Endpoint> = {
      address: process.env.BACKEND_APP_ADDRESS || "127.0.0.1",
      port: process.env.BACKEND_APP_PORT || "8080",
    };

    const blackboxApp: Readonly<Endpoint> = {
      address: process.env.BLACKBOX_APP_ADDRESS || "127.0.0.1",
      port: process.env.BLACKBOX_APP_PORT || "8080",
    };

    try {
      const response = await axios
        .get<Array<Readonly<User>>>(`http://${backendApp.address}:${backendApp.port}/users`);

      const operations = response
        .data
        .map((user) => new Promise<ProcessedUser>(async (resolve, reject) => {
          const { age } = user;
          try {
            const blackboxResponse = await axios
              .get<Readonly<BlackboxServiceResponse>>(`http://${blackboxApp.address}:${blackboxApp.port}/adult`, {
                params: { age },
              });
            const { adult } = blackboxResponse.data;
            resolve({ ...user, adult });
          } catch (error) {
            reject(error);
          }
        }));

      const users = await Promise.all(operations);
      exchange.response.send({ users });
    } catch (err) {
      exchange.response.code(500).send(err);
    }
  }
}
