import { AES, enc, mode } from "crypto-js";
import JSZip from "jszip";
import { Project } from "./types/project";

export async function loadProject(
  userFolder: string,
  fileName: string,
): Promise<Project> {
  const project = await getSb3(userFolder, fileName);
  const encryptedBs64 = await project.file("project.json").async("string");
  return JSON.parse(decryptProjectJson(encryptedBs64));
}

async function getSb3(userFolder: string, fileName: string): Promise<JSZip> {
  const url = new URL(
    `${userFolder}/${fileName}.sb3`,
    "https://zhishi.oss-cn-beijing.aliyuncs.com/user_projects_sb3/",
  );
  const encrypted = await fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error(`failed to get project ${url}`);
    }
    return res.text();
  });
  const key = enc.Base64.parse("KzdnFCBRvq3" + fileName);
  key.sigBytes = 32;
  const iv = key.clone();
  iv.sigBytes = 16;
  iv.words.splice(4);
  const decrypted = AES.decrypt(encrypted, key, {
    iv,
    mode: mode.CBC,
  }).toString(enc.Utf8);
  const bytes = Uint8Array.from(decrypted.split(",").map((v) => parseInt(v)));
  const project = await JSZip.loadAsync(bytes);
  return project;
}

function decryptProjectJson(projectJSON: string): string {
  if (projectJSON.startsWith("{")) {
    return projectJSON;
  }
  const idx = projectJSON.length - 1;
  const n = idx % 10;
  const r = projectJSON.charAt(idx);
  const decryptedBs64 = `${projectJSON.substring(0, n)}${r}${projectJSON.substring(n + 1, idx)}`;
  return decodeURIComponent(atob(decryptedBs64));
}
