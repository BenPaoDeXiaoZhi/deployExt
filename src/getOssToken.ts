import { AES, enc } from "crypto-js";
import { communityWeb } from "@ccw-api/api";

type OssRes = {
  accessKeyId: string;
  securityToken: string;
  accessKeySecret: string;
};

export async function getOssToken() {
  const { oid } = await communityWeb.getStudentSelfDetail(false, false, []);
  const { data } = await communityWeb.getCcwMainStatus();
  const iv = enc.Utf8.parse(oid.substring(0, 16));
  const key = enc.Utf8.parse(oid.substring(8));
  const decrypted = AES.decrypt(data, key, { iv });
  const dat: OssRes = JSON.parse(decrypted.toString(enc.Utf8));
  const { accessKeyId, securityToken, accessKeySecret } = dat;
  return { accessKeyId, accessKeySecret, stsToken: securityToken };
}
