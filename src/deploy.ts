import { readFileSync } from "fs";
import { Project } from "./types/project";
import { MD5 } from "crypto-js";
import OSS from "ali-oss";
import { warning } from "@actions/core";

function getDate(): string {
  return new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" });
}

function updateComment(project: Project): Project {
  const stage = project.targets.find((t) => t.isStage);
  if (!stage) {
    throw new Error("failed to get stage target");
  }
  stage.comments["CCW_EXT_DEPLOY"] = {
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
time: ${getDate()}`,
  };
  return project;
}

async function updateExtFile(
  project: Project,
  oss: OSS,
  extPath: string,
): Promise<Project> {
  const { assets } = project.gandi;
  const extContent = readFileSync(extPath).toString("utf-8");
  const extMD5 = MD5(extContent).toString();
  try {
    await oss.put(`user_projects_assets/${extMD5}.js`, Buffer.from(extContent));
  } catch (e) {
    warning(`[CCW Extension Deploy] File ${extMD5}.js already exists`);
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
    assets.push(extAsset);
  }
  extAsset.assetId = extMD5;
  extAsset.md5ext = `${extMD5}.js`;
  project.gandi.assets = assets;
  return project;
}

export async function deploy(project: Project, oss: OSS, extPath: string) {
  project = await updateExtFile(project, oss, extPath);
  project = updateComment(project);
  return project;
}
