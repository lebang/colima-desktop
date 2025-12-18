# Colima 帮助文档

> Colima 为 macOS 提供了一个简洁的容器运行时环境，支持 Docker、containerd 和 Kubernetes。

**版本信息**: `colima version 0.9.1`

---

## 目录

- [概述](#概述)
- [全局参数](#全局参数)
- [常用命令](#常用命令)
  - [start - 启动](#start---启动)
  - [stop - 停止](#stop---停止)
  - [status - 状态](#status---状态)
  - [restart - 重启](#restart---重启)
  - [delete - 删除](#delete---删除)
  - [list - 列出实例](#list---列出实例)
  - [ssh - 连接虚拟机](#ssh---连接虚拟机)
  - [kubernetes - Kubernetes管理](#kubernetes---kubernetes管理)
  - [template - 模板配置](#template---模板配置)
- [使用示例](#使用示例)

---

## 概述

Colima 在 macOS 上以最小化配置提供容器运行时环境。它支持以下运行时：
- **Docker** (默认)
- **containerd**
- **incus**

同时支持可选的 **Kubernetes** 集群。

## 全局参数

所有命令均支持以下全局参数：

| 参数 | 缩写 | 说明 |
|------|------|------|
| `--profile <name>` | `-p` | 实例名称，用于多实例管理 (默认: "default") |
| `--verbose` | `-v` | 启用详细日志 |
| `--very-verbose` | | 启用更详细的日志 |
| `--help` | `-h` | 显示帮助信息 |
| `--version` | | 显示版本信息 |

---

## 常用命令

### start - 启动

启动 Colima，支持指定容器运行时和可选的 Kubernetes。

```bash
colima start [profile] [flags]
```

**常用参数：**

| 参数 | 缩写 | 说明 | 默认值 |
|------|------|------|--------|
| `--cpus` | `-c` | CPU 核心数 | 2 |
| `--memory` | `-m` | 内存大小 (GiB) | 2 |
| `--disk` | `-d` | 磁盘大小 (GiB) | 100 |
| `--runtime` | `-r` | 容器运行时 (docker/containerd/incus) | docker |
| `--kubernetes` | `-k` | 启用 Kubernetes | false |
| `--arch` | `-a` | 架构 (aarch64/x86_64) | aarch64 |
| `--edit` | `-e` | 启动前编辑配置文件 | false |
| `--foreground` | `-f` | 前台运行 | false |
| `--vm-type` | `-t` | 虚拟机类型 (qemu/vz) | vz |
| `--mount` | `-V` | 挂载目录，后缀 `:w` 表示可写 | - |
| `--dns` | `-n` | 自定义 DNS 服务器 | - |
| `--network-address` | | 为 VM 分配可达 IP 地址 | false |
| `--ssh-agent` | `-s` | 转发 SSH agent 到 VM | false |
| `--vz-rosetta` | | 启用 Rosetta 进行 amd64 模拟 | false |

**Kubernetes 相关参数：**

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--kubernetes-version` | k3s 版本 | v1.33.4+k3s1 |
| `--k3s-arg` | 传递给 k3s 的额外参数 | --disable=traefik |

**示例：**

```bash
# 基本启动
colima start

# 编辑配置后启动
colima start --edit

# 自定义资源配置
colima start --cpu 4 --memory 8 --disk 100

# 启用 Kubernetes
colima start --kubernetes

# 使用 containerd 运行时并启用 K8s
colima start --runtime containerd --kubernetes

# 使用特定架构
colima start --arch x86_64

# 自定义 DNS
colima start --dns 8.8.8.8 --dns 8.8.4.4

# 挂载目录（只读）
colima start --mount /path/to/dir

# 挂载目录（可写）
colima start --mount /path/to/dir:w
```

---

### stop - 停止

停止 Colima 以释放系统资源。VM 状态会被持久化，下次启动时恢复。

```bash
colima stop [profile] [flags]
```

**参数：**

| 参数 | 缩写 | 说明 |
|------|------|------|
| `--force` | `-f` | 强制停止，不进行优雅关闭 |

**示例：**

```bash
# 正常停止
colima stop

# 强制停止
colima stop --force

# 停止指定实例
colima stop --profile myprofile
```

---

### status - 状态

显示 Colima 的运行状态。

```bash
colima status [profile] [flags]
```

**参数：**

| 参数 | 缩写 | 说明 |
|------|------|------|
| `--extended` | `-e` | 显示额外详细信息 |
| `--json` | `-j` | 输出 JSON 格式 |

**示例：**

```bash
# 查看状态
colima status

# 查看详细状态
colima status --extended

# JSON 格式输出
colima status --json
```

---

### restart - 重启

重启 Colima 实例。

```bash
colima restart [profile]
```

---

### delete - 删除

删除 Colima 及所有设置。**请谨慎使用**，此操作会删除所有数据。

```bash
colima delete [profile] [flags]
```

**参数：**

| 参数 | 缩写 | 说明 |
|------|------|------|
| `--data` | `-d` | 同时删除容器运行时数据 |
| `--force` | `-f` | 不提示确认直接删除 |

**示例：**

```bash
# 删除（会提示确认）
colima delete

# 强制删除
colima delete --force

# 删除包括运行时数据
colima delete --data --force
```

---

### list - 列出实例

列出所有已创建的 Colima 实例。

```bash
colima list [flags]
```

**别名：** `ls`

**参数：**

| 参数 | 缩写 | 说明 |
|------|------|------|
| `--json` | `-j` | 输出 JSON 格式 |

**示例：**

```bash
# 列出所有实例
colima list

# JSON 格式输出
colima ls --json
```

---

### ssh - 连接虚拟机

SSH 连接到 Colima 虚拟机。

```bash
colima ssh [flags] [-- command]
```

**别名：** `exec`, `x`

**示例：**

```bash
# 进入 VM shell
colima ssh

# 在 VM 中执行命令
colima ssh -- htop

# 查看 VM 内存
colima ssh -- free -h

# 查看 VM 磁盘
colima ssh -- df -h
```

---

### kubernetes - Kubernetes管理

管理 Kubernetes 集群。

```bash
colima kubernetes [command]
```

**别名：** `kube`, `k8s`, `k3s`, `k`

**子命令：**

| 命令 | 说明 |
|------|------|
| `start` | 启动 Kubernetes 集群 |
| `stop` | 停止 Kubernetes 集群 |
| `reset` | 重置 Kubernetes 集群 |
| `delete` | 删除 Kubernetes 集群 |

**示例：**

```bash
# 启动 K8s 集群
colima kubernetes start

# 停止 K8s 集群
colima k8s stop

# 重置 K8s 集群
colima k reset

# 删除 K8s 集群
colima kube delete
```

---

### template - 模板配置

编辑新实例的默认配置模板。

```bash
colima template [flags]
```

**别名：** `tmpl`, `tpl`, `t`

**参数：**

| 参数 | 说明 |
|------|------|
| `--editor <name>` | 指定编辑器 (vim/nano/code等) |
| `--print` | 打印配置文件路径，不编辑 |

**示例：**

```bash
# 编辑默认模板
colima template

# 使用 VS Code 编辑
colima template --editor code

# 查看配置文件路径
colima template --print
```

---

## 使用示例

### 快速开始

```bash
# 使用默认配置启动 (Docker 运行时)
colima start

# 验证 Docker 是否工作
docker ps

# 停止
colima stop
```

### 开发环境配置

```bash
# 创建高配开发环境
colima start \
  --cpu 4 \
  --memory 8 \
  --disk 100 \
  --mount ~/projects:w

# 启用 Kubernetes
colima start --kubernetes
kubectl get nodes
```

### 多实例管理

```bash
# 创建名为 "dev" 的实例
colima start --profile dev --cpu 2 --memory 4

# 创建名为 "prod" 的实例
colima start --profile prod --cpu 4 --memory 8

# 列出所有实例
colima list

# 切换/停止特定实例
colima stop --profile dev
colima start --profile prod
```

### 调试与维护

```bash
# 查看详细状态
colima status --extended

# SSH 进入 VM 调试
colima ssh

# 查看日志
colima start --verbose

# 重置环境（谨慎）
colima delete --force
colima start
```

---

## 其他命令

| 命令 | 说明 |
|------|------|
| `completion` | 生成 shell 自动补全脚本 |
| `ssh-config` | 显示 SSH 连接配置 |
| `nerdctl` | 运行 nerdctl (需要 containerd 运行时) |
| `prune` | 清理缓存的下载资源 |
| `update` | 更新容器运行时 |
| `version` | 显示版本信息 |

---

## 参考链接

- [Colima GitHub](https://github.com/abiosoft/colima)
- [k3s Releases](https://github.com/k3s-io/k3s/releases)
