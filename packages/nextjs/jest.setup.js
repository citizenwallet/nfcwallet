import fs from "fs";

require("dotenv").config({ path: ".env.test" });

expect.extend({
  toBeBoolean(received) {
    const pass = typeof received === "boolean";
    if (pass) {
      return {
        message: () => `expected ${received} to be a boolean`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a boolean, but received ${typeof received}`,
        pass: false,
      };
    }
  },
});
