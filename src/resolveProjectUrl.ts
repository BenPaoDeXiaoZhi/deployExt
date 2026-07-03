import { communityWeb } from "@ccw-api/api";
export async function getUserFolderAndSb3MD5(projectOid: string) {
  const { latestProjectLink } = await communityWeb.getCreationDetail(
    projectOid,
    "",
    "EDIT",
  );
  const userFolder = latestProjectLink.split("/").at(-2);
  const [sb3MD5] = latestProjectLink.split("/").at(-1).split(".");
  return { userFolder, sb3MD5 };
}
