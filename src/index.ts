import { error, getInput, info } from "@actions/core";
import { resolve } from "path";
import { setToken } from "@ccw-api/api";
import OSS from "ali-oss";
import { getOssToken } from "./getOssToken";
import { loadProject } from "./loadProject";
import { saveProject } from "./saveProject";
import { deploy } from "./deploy";
import { getUserFolderAndSb3MD5 } from "./resolveProjectUrl";
import { Teamwork } from "@ccw-api/teamwork";
import { Project } from "./types/project";

const file = getInput("file") || "test.js";
const ccwToken = getInput("token") || process.env.CCW_TOKEN;
const root = process.env.GITHUB_WORKSPACE || "./";
const projectOid = getInput("project-oid") || process.env.PROJECT_OID;

if (!ccwToken || !projectOid) {
  error("[CCW Extension Deploy] config error!");
  process.exit(1);
}

async function main() {
  setToken(ccwToken);
  const extPath = resolve(root, file);
  info(`[CCW Extension Deploy] Deploying "${extPath}" to ccw...`);
  const { accessKeyId, accessKeySecret, stsToken } = await getOssToken();
  const oss = new OSS({
    refreshSTSToken: getOssToken,
    accessKeyId,
    accessKeySecret,
    stsToken,
    bucket: "zhishi",
    region: "oss-cn-beijing",
  });
  const { userFolder, sb3MD5, isTeamwork } =
    await getUserFolderAndSb3MD5(projectOid);
  let project: Project;
  let tw: Teamwork | null;
  if (isTeamwork) {
    info(
      `[CCW Extension Deploy] Initializing teamwork for Project ${projectOid}`,
    );
    tw = new Teamwork(ccwToken, projectOid);
    const meta: any = await tw.connect();
    const { fullJson: fullJson_ } = meta;
    const fullJson = JSON.parse(fullJson_);
    project = fullJson;
  } else {
    project = await loadProject(userFolder, sb3MD5);
  }
  project = await deploy(project, oss, extPath, tw);
  if (!tw) {
    await saveProject(oss, userFolder, sb3MD5, project, isTeamwork);
  }
  info("[CCW Extension Deploy] Successfully deployed extension!");
  if (tw) {
    tw.dispose();
  }
}

main().catch((e) => error(`[ccw ext deploy] ${e}`));
