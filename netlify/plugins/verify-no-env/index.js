import { readdir } from "node:fs/promises";
import { basename, join } from "node:path";

async function findEnvironmentFiles(directory) {
  const matches = [];

  async function visit(currentDirectory) {
    let entries;
    try {
      entries = await readdir(currentDirectory, { withFileTypes: true });
    } catch (error) {
      if (error?.code === "ENOENT") {
        return;
      }
      throw error;
    }

    for (const entry of entries) {
      const entryPath = join(currentDirectory, entry.name);
      if (entry.isDirectory()) {
        await visit(entryPath);
      } else if (entry.name === ".env" || entry.name.startsWith(".env.")) {
        matches.push(entryPath);
      }
    }
  }

  await visit(directory);
  return matches;
}

export async function onBuild({ constants, utils }) {
  const environmentFiles = await findEnvironmentFiles(constants.INTERNAL_FUNCTIONS_SRC);

  if (environmentFiles.length > 0) {
    utils.build.failBuild(
      `Refusing to bundle environment files: ${environmentFiles.map((filePath) => basename(filePath)).join(", ")}`,
    );
  }
}
