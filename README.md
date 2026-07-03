# CCW Extension Deployment

将 Gandi 扩展文件部署到 CCW 的 GitHub Action。

## 功能

- 上传扩展 JS 文件到阿里云 OSS
- 自动更新项目资产列表中的扩展引用
- 在项目舞台角色中添加部署信息注释（仓库、提交者、SHA、时间）

## 输入参数

| 参数          | 描述                                    | 必填 | 默认值          |
| ------------- | --------------------------------------- | ---- | --------------- |
| `file`        | 要部署的扩展文件路径                    | 是   | `dist/index.js` |
| `project-oid` | CCW 项目的 OID（即项目 URL 的最后一段） | 是   | -               |
| `token`       | CCW Token                               | 是   | -               |

## 使用示例

```yaml
name: Deploy Extension

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v7.0.0

      - name: Build extension
        run: npm ci && npm run build

      - name: Deploy to CCW
        uses: BenPaoDeXiaoZhi/ccw-ext-deploy@main
        with:
          file: dist/index.js
          project-oid: 6a478a20657fa02c80b54350
          token: ${{ secrets.CCW_TOKEN }}
```

### 获取 project-oid

项目 URL 形如 `https://www.ccw.site/gandi/extension/6a478a20657fa02c80b54350`，其中 `6a478a20657fa02c80b54350` 即为 `project-oid`。
