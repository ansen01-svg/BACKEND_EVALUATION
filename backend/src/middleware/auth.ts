import * as dotenv from "dotenv";
import createHttpError from "http-errors";
import JWT, { SignOptions } from "jsonwebtoken";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

export default {
  signAuthToken: (payload: any) => {
    return new Promise((resolve, reject) => {
      const options: SignOptions = {
        expiresIn: "5m",
        issuer: "",
        audience: "",
      };

      JWT.sign(payload, JWT_SECRET, options, (err, token) => {
        if (err) {
          reject(createHttpError.InternalServerError());
          return;
        }

        resolve(token);
      });
    });
  },

  verifyAuthToken: (token: string) => {
    try {
      return JWT.verify(token, JWT_SECRET);
    } catch {
      return null;
    }
  },
};
