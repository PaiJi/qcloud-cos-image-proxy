# GitHub Actions 配置说明

## Docker 发布工作流

`docker-publish.yml` 工作流会在你推送以 `v` 开头的 Git tag 时自动触发，构建 Docker 镜像并推送到 DockerHub。

## 配置步骤

### 1. 设置 DockerHub Secrets

在你的 GitHub 仓库中，进入 **Settings** > **Secrets and variables** > **Actions**，添加以下两个 Repository secrets：

- `DOCKERHUB_USERNAME`: 你的 DockerHub 用户名
- `DOCKERHUB_TOKEN`: 你的 DockerHub Access Token（不是密码）

### 2. 获取 DockerHub Access Token

1. 登录 [DockerHub](https://hub.docker.com/)
2. 点击右上角头像 > **Account Settings**
3. 选择 **Security** 选项卡
4. 点击 **New Access Token**
5. 输入描述（如：GitHub Actions），选择权限为 **Read, Write, Delete**
6. 复制生成的 token 并保存到 GitHub Secrets

### 3. 使用方法

创建并推送一个版本 tag：

```bash
git tag v1.0.0
git push origin v1.0.0
```

工作流会自动：
- 构建 Docker 镜像（支持 linux/amd64 和 linux/arm64 架构）
- 使用 tag 版本号作为镜像标签
- 推送到 DockerHub

### 4. 镜像命名规则

镜像将使用以下命名格式：
```
docker.io/{你的用户名}/qcloud-cos-image-proxy:v1.0.0
docker.io/{你的用户名}/qcloud-cos-image-proxy:1.0.0
docker.io/{你的用户名}/qcloud-cos-image-proxy:1.0
docker.io/{你的用户名}/qcloud-cos-image-proxy:1
```

其中 `{你的用户名}` 是你的 GitHub 用户名。