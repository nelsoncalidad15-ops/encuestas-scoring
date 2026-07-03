import { handleProxy } from "./_proxy.js";

export default async function handler(req, res) {
  return handleProxy(req, res, "guardarEncuesta");
}
