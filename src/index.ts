import { context, getOctokit } from "@actions/github";
import { error, getInput, info } from "@actions/core";

const file = getInput("file");

async function main() {
  const token = process.env["GITHUB_TOKEN"];
  if (!token) {
    error("failed to get token");
    return;
  }
  const kit = getOctokit(token);
  const content = await kit.rest.repos.getContent({
    owner: context.repo.owner,
    repo: context.repo.repo,
    path: file,
  });
  info(JSON.stringify(content));
  if (!("type" in content) || content.type != "file") {
    error("failed to get ext file");
    return;
  }
}
