import { error, getInput, info } from "@actions/core";
import { resolve } from "path";
import { setToken } from "@ccw-api/api";
import OSS from "ali-oss";
import { getOssToken } from "./getOssToken";
import { loadProject } from "./loadProject";
import { saveProject } from "./saveProject";
import { deploy } from "./deploy";

const file = getInput("file") || "test.js";
const ccwToken = getInput("token") || process.env.CCW_TOKEN;
const root = process.env.GITHUB_WORKSPACE || "./";
const userDir = getInput("user-dir") || process.env.USER_DIR;
const projectFileId =
  getInput("project-file-id") || process.env.PROJECT_FILE_ID;

if (!ccwToken || !userDir || !projectFileId) {
  error("[CCW Extension Deploy] config error!");
  process.exit(1);
}

async function main() {
  setToken(ccwToken);
  const extPath = resolve(root, file);
  info(`[CCW Extension Deploy] deploying "${extPath}" to ccw`);
  const { accessKeyId, accessKeySecret, stsToken } = await getOssToken();
  const oss = new OSS({
    refreshSTSToken: getOssToken,
    accessKeyId,
    accessKeySecret,
    stsToken,
    bucket: "zhishi",
    region: "oss-cn-beijing",
  });
  let project = await loadProject(userDir, projectFileId);
  saveProject(oss, userDir, projectFileId, project);
  project = await deploy(project, oss, extPath);
  await saveProject(oss, userDir, projectFileId, project);
  info("[CCW Extension Deploy] successfully deployed extension");
}

main().catch((e) => error(`[ccw ext deploy] ${e}`));
