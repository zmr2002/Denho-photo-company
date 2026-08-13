import { cpSync, existsSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const applicationRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const standaloneRoot = resolve(applicationRoot, ".next", "standalone", "apps", "web");
const serverPath = resolve(standaloneRoot, "server.js");

if (!existsSync(serverPath)) {
  throw new Error("Production build not found. Run npm run build before npm run start.");
}

copyRuntimeDirectory(
  resolve(applicationRoot, "public"),
  resolve(standaloneRoot, "public"),
);
copyRuntimeDirectory(
  resolve(applicationRoot, ".next", "static"),
  resolve(standaloneRoot, ".next", "static"),
);

await import(pathToFileURL(serverPath).href);

function copyRuntimeDirectory(source, destination) {
  rmSync(destination, { force: true, recursive: true });
  cpSync(source, destination, { recursive: true });
}
