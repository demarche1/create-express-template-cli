import fs from "fs";
import ncp from "ncp";
import path from "path";
import { promisify } from "util";
import clc from "cli-color";
import execa from "execa";
import Listr from "listr";
import { projectInstall } from "pkg-install";

const access = promisify(fs.access);
const copy = promisify(ncp);

async function copyTemplateFiles(options) {
  return copy(
    options.templateDirectory,
    `${options.targetDirectory}/${options.projectName}`,
    {
      clobber: false,
    }
  );
}

async function initializeGit(options) {
  try {
    await execa("git", ["init"], {
      cwd: `${options.targetDirectory}/${options.projectName}`,
    });
  } catch (error) {
    console.error("%s failed to initialize git", clc.bgRed(clc.black("ERROR")));
    process.exit(1);
  }
}

async function createProjectDirectory(options) {
  try {
    if (!options.projectName || !options.projectName.length) {
      console.error(
        "%s project name is required",
        clc.bgRed(clc.black("ERROR"))
      );
      process.exit(1);
    }

    await execa("mkdir", [options.projectName], {
      cwd: options.targetDirectory,
    });
  } catch (error) {
    console.error(
      "%s failed to create project directory",
      clc.bgRed(clc.black("ERROR"))
    );
    process.exit(1);
  }
}

export async function createProject(options) {
  options = {
    ...options,
    targetDirectory: options.targetDirectory || process.cwd(),
  };

  const currentFileUrl = import.meta.url;
  const templateDir = path.resolve(
    new URL(currentFileUrl).pathname,
    "../../templates",
    options.template.toLowerCase()
  );
  options.templateDirectory = templateDir;

  try {
    await access(templateDir, fs.constants.R_OK);
  } catch (err) {
    console.error("%s Invalid template name", clc.bgRed(clc.black("ERROR: ")));
    process.exit(1);
  }

  const tasks = new Listr([
    {
      title: "Create project directory",
      task: () => createProjectDirectory(options),
      skip: () => false,
    },
    {
      title: "Copy project files",
      task: () => copyTemplateFiles(options),
    },
    {
      title: "Initialize git",
      task: () => initializeGit(options),
      skip: () => !options.git,
    },
    {
      title: "Install dependencies",
      task: () =>
        projectInstall({
          cwd: `${options.targetDirectory}/${options.projectName}`,
        }),
      skip: () => !options.runInstall,
    },
  ]);

  await tasks.run();
  console.log("%s Project ready", clc.bgGreen(clc.black("DONE! ")));
  return true;
}
