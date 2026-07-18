import { readFileSync } from "fs";
import { Project } from "./types/project";
import { MD5 } from "crypto-js";
import OSS from "ali-oss";
import { error, info, warning } from "@actions/core";
import { Teamwork } from "@ccw-api/teamwork";

function getDate(): string {
  return new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" });
}

async function updateComment(
  project: Project,
  userInfo: { name: string; oid: string },
  tw?: Teamwork,
): Promise<Project> {
  const stage = project.targets.find((t) => t.isStage);
  if (!stage) {
    throw new Error("failed to get stage target");
  }
  const comment = {
    id: "CCW_EXT_DEPLOY",
    blockId: null,
    x: 0,
    y: 0,
    width: 400,
    height: 200,
    minimized: false,
    text: `[Deployed by CCW-Extension-Deployment workflow]
repo: ${process.env.GITHUB_REPOSITORY}
actor: ${process.env.GITHUB_ACTOR}
sha: ${process.env.GITHUB_SHA}
time: ${getDate()}
ccw token: ${userInfo.oid}(${userInfo.name})`,
  };
  if (tw) {
    if (!stage.id) {
      error(
        "[CCW Extension Deploy] Failed to get Stage target id of the teamwork project!",
      );
      throw new Error("Failed to get Stage target id");
    }
    if ("CCW_EXT_DEPLOY" in stage.comments) {
      await tw.updateComment(stage.id, comment);
    } else {
      await tw.createComment(stage.id, comment);
    }
  }
  info("[CCW Extension Deploy] Successfully updated metadata comment!");
  stage.comments["CCW_EXT_DEPLOY"] = comment;
  return project;
}

async function updateExtFile(
  project: Project,
  oss: OSS,
  extPath: string,
  tw?: Teamwork,
): Promise<Project> {
  if (!project.gandi) {
    project.gandi = {
      assets: [],
    };
  }
  const { assets } = project.gandi;
  const extContent = readFileSync(extPath).toString("utf-8");
  const extMD5 = MD5(extContent).toString();
  try {
    await oss.put(`user_projects_assets/${extMD5}.js`, Buffer.from(extContent));
  } catch (e) {
    warning(`[CCW Extension Deploy] OSS File ${extMD5}.js already exists`);
  }
  let extAsset = assets.find((a) => a.name == "extension");
  if (!extAsset) {
    extAsset = {
      id: "EXTENSION".padStart(20, "_"),
      assetId: extMD5,
      name: "extension",
      md5ext: `${extMD5}.js`,
      dataFormat: "js",
    };
    if (tw) {
      await tw.createGandiAsset(extAsset);
    }
    assets.push(extAsset);
  }
  extAsset.assetId = extMD5;
  extAsset.md5ext = `${extMD5}.js`;
  if (tw) {
    await tw.updateGandiAsset(extAsset);
  }
  info(`[CCW Extension Deploy] Successfully updated extension asset!`);
  project.gandi.assets = assets;
  return project;
}

export async function deploy(
  project: Project,
  oss: OSS,
  extPath: string,
  userInfo: { name: string; oid: string },
  teamwork?: Teamwork,
) {
  project = await updateExtFile(project, oss, extPath, teamwork);
  project = await updateComment(project, userInfo, teamwork);
  return project;
}
