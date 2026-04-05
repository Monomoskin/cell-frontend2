import fs from "node:fs";

export function isDev() {
  return process.env.NODE_ENV === "development";
}
