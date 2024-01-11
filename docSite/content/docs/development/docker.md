---
title: 'Docker Compose 快速部署'
description: '使用 Docker Compose 快速部署 FastGPT'
icon: ''
draft: false
toc: true
weight: 707
---

## 推荐配置

{{< table "table-hover table-striped-columns" >}}
| 环境 | 最低配置（单节点） | 推荐配置 |
| ---- | ---- | ---- |
| 测试 | 2c2g  | 2c4g |
| 100w 组向量 | 4c8g 50GB | 4c16g 50GB |
| 500w 组向量 | 8c32g | 16c64g 200GB |
{{< /table >}}

### 1. 准备好代理环境（国外服务器可忽略）

确保可以访问 OpenAI，具体方案可以参考：[代理方案](/docs/development/proxy/)。或直接在 Sealos 上 [部署 OneAPI](/docs/development/one-api)，既解决代理问题也能实现多 Key 轮询、接入其他大模型。

### 2. 多模型支持

FastGPT 使用了 one-api 项目来管理模型池，其可以兼容 OpenAI 、Azure 、国内主流模型和本地模型等。

可选择 [Sealos 快速部署 OneAPI](/docs/development/one-api)，更多部署方法可参考该项目的 [README](https://github.com/songquanpeng/one-api)，也可以直接通过以下按钮一键部署：

<a href="https://template.cloud.sealos.io/deploy?templateName=one-api" rel="external" target="_blank"><img src="https://cdn.jsdelivr.us/gh/labring-actions/templates@main/Deploy-on-Sealos.svg" alt="Deploy on Sealos"/></a>

## 一、安装 Docker 和 docker-compose

{{< tabs tabTotal="3" >}}
{{< tab tabName="Linux" >}}
{{< markdownify >}}

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
systemctl enable --now docker
# 安装 docker-compose
curl -L https://github.com/docker/compose/releases/download/2.20.3/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
# 验证安装
docker -v
docker-compose -v
# 如失效，自行百度~
```

{{< /markdownify >}}
{{< /tab >}}
{{< tab tabName="MacOS" >}}
{{< markdownify >}}
推荐直接使用 [Orbstack](https://orbstack.dev/)。可直接通过 Homebrew 来安装：

```bash
brew install orbstack
```

或者直接[下载安装包](https://orbstack.dev/download)进行安装。
{{< /markdownify >}}
{{< /tab >}}
{{< tab tabName="Windows" >}}
{{< markdownify >}}

我们建议将源代码和其他数据绑定到 Linux 容器中时，将其存储在 Linux 文件系统中，而不是 Windows 文件系统中。

可以选择直接[使用 WSL 2 后端在 Windows 中安装 Docker Desktop](https://docs.docker.com/desktop/wsl/)。

也可以直接[在 WSL 2 中安装命令行版本的 Docker](https://nickjanetakis.com/blog/install-docker-in-wsl-2-without-docker-desktop)。

{{< /markdownify >}}
{{< /tab >}}
{{< /tabs >}}

## 二、创建目录并下载 docker-compose.yml

依次执行下面命令，创建 FastGPT 文件并拉取`docker-compose.yml`和`config.json`，执行完后目录下会有 2 个文件。

非 Linux 环境或无法访问外网环境，可手动创建一个目录，并下载下面2个链接的文件: [docker-compose.yml](https://github.com/labring/FastGPT/blob/main/files/deploy/fastgpt/docker-compose.yml),[config.json](https://github.com/labring/FastGPT/blob/main/projects/app/data/config.json)

**注意: `docker-compose.yml` 配置文件中 Mongo 为 5.x，部分服务器不支持，需手动更改其镜像版本为 4.4.24**

```bash
mkdir fastgpt
cd fastgpt
curl -O https://raw.githubusercontent.com/labring/FastGPT/main/files/deploy/fastgpt/docker-compose.yml
curl -O https://raw.githubusercontent.com/labring/FastGPT/main/projects/app/data/config.json
```


## 三、启动容器

修改`docker-compose.yml`中的`OPENAI_BASE_URL`和`CHAT_API_KEY`即可，对应为 API 的地址(别忘记加/v1)和 key。

```bash
# 在 docker-compose.yml 同级目录下执行
docker-compose pull
docker-compose up -d
```

## 四、访问 FastGPT

目前可以通过 `ip:3000` 直接访问(注意防火墙)。登录用户名为 `root`，密码为`docker-compose.yml`环境变量里设置的 `DEFAULT_ROOT_PSW`。

如果需要域名访问，请自行安装并配置 Nginx。
