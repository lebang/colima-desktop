use serde::{Deserialize, Serialize};
use std::process::Command;

// ========== 通用命令结果结构 ==========

#[derive(Debug, Serialize, Deserialize)]
pub struct CommandOutput {
    pub success: bool,
    pub stdout: String,
    pub stderr: String,
    pub code: Option<i32>,
}

// ========== 参数构建器 ==========

/// 简化命令参数构建的辅助结构
struct ArgsBuilder {
    args: Vec<String>,
}

impl ArgsBuilder {
    fn new(initial: &[&str]) -> Self {
        Self {
            args: initial.iter().map(|s| s.to_string()).collect(),
        }
    }

    /// 添加可选的键值对参数
    fn add_opt<T: ToString>(&mut self, flag: &str, value: Option<T>) -> &mut Self {
        if let Some(v) = value {
            self.args.push(flag.to_string());
            self.args.push(v.to_string());
        }
        self
    }

    /// 添加可选的布尔标志
    fn add_flag(&mut self, flag: &str, condition: bool) -> &mut Self {
        if condition {
            self.args.push(flag.to_string());
        }
        self
    }

    /// 添加单个参数
    fn add(&mut self, arg: &str) -> &mut Self {
        self.args.push(arg.to_string());
        self
    }

    /// 获取参数引用切片用于命令执行
    fn as_refs(&self) -> Vec<&str> {
        self.args.iter().map(|s| s.as_str()).collect()
    }
}

// ========== 通用命令执行函数 ==========

fn run_command(cmd: &str, args: &[&str]) -> CommandOutput {
    match Command::new(cmd).args(args).output() {
        Ok(output) => CommandOutput {
            success: output.status.success(),
            stdout: String::from_utf8_lossy(&output.stdout).to_string(),
            stderr: String::from_utf8_lossy(&output.stderr).to_string(),
            code: output.status.code(),
        },
        Err(e) => CommandOutput {
            success: false,
            stdout: String::new(),
            stderr: format!("执行命令失败: {}", e),
            code: None,
        },
    }
}

/// 使用 ArgsBuilder 执行命令
fn run_with_builder(cmd: &str, builder: &ArgsBuilder) -> CommandOutput {
    run_command(cmd, &builder.as_refs())
}

// ========== Colima 命令 ==========

#[tauri::command]
fn colima_status() -> CommandOutput {
    run_command("colima", &["status", "-p", "default", "--json"])
}

#[tauri::command]
fn colima_list() -> CommandOutput {
    run_command("colima", &["list", "--json"])
}

#[tauri::command]
async fn colima_start(cpu: Option<u32>, memory: Option<u32>, disk: Option<u32>) -> CommandOutput {
    let mut builder = ArgsBuilder::new(&["start"]);
    builder
        .add_opt("--cpu", cpu)
        .add_opt("--memory", memory)
        .add_opt("--disk", disk);
    run_with_builder("colima", &builder)
}

#[tauri::command]
async fn colima_stop() -> CommandOutput {
    run_command("colima", &["stop"])
}

#[tauri::command]
async fn colima_delete(force: Option<bool>) -> CommandOutput {
    let mut builder = ArgsBuilder::new(&["delete"]);
    builder.add_flag("--force", force.unwrap_or(false));
    run_with_builder("colima", &builder)
}

// ========== Docker 查询命令 ==========

#[tauri::command]
fn docker_container_list(all: Option<bool>) -> CommandOutput {
    let mut builder = ArgsBuilder::new(&["ps"]);
    builder
        .add_flag("-a", all.unwrap_or(true))
        .add("--format").add("json");
    run_with_builder("docker", &builder)
}

#[tauri::command]
fn docker_image_list() -> CommandOutput {
    run_command("docker", &["images", "--format", "json"])
}

#[tauri::command]
fn docker_volume_list() -> CommandOutput {
    run_command("docker", &["volume", "ls", "--format", "json"])
}

#[tauri::command]
fn docker_network_list() -> CommandOutput {
    run_command("docker", &["network", "ls", "--format", "json"])
}

#[tauri::command]
fn docker_info() -> CommandOutput {
    run_command("docker", &["info", "--format", "json"])
}

#[tauri::command]
fn docker_disk_usage() -> CommandOutput {
    run_command("docker", &["system", "df", "--format", "json"])
}

#[tauri::command]
fn docker_stats() -> CommandOutput {
    run_command("docker", &["stats", "--no-stream", "--format", "json"])
}

// ========== 容器操作命令 ==========

#[tauri::command]
async fn docker_container_start(container_id: String) -> CommandOutput {
    run_command("docker", &["start", &container_id])
}

#[tauri::command]
async fn docker_container_stop(container_id: String) -> CommandOutput {
    run_command("docker", &["stop", &container_id])
}

#[tauri::command]
async fn docker_container_restart(container_id: String) -> CommandOutput {
    run_command("docker", &["restart", &container_id])
}

#[tauri::command]
async fn docker_container_remove(container_id: String, force: Option<bool>) -> CommandOutput {
    let mut builder = ArgsBuilder::new(&["rm"]);
    builder
        .add_flag("-f", force.unwrap_or(false))
        .add(&container_id);
    run_with_builder("docker", &builder)
}

#[tauri::command]
fn docker_container_logs(container_id: String, tail: Option<u32>) -> CommandOutput {
    let mut builder = ArgsBuilder::new(&["logs"]);
    builder
        .add_opt("--tail", tail)
        .add(&container_id);
    run_with_builder("docker", &builder)
}

// ========== 镜像操作命令 ==========

#[tauri::command]
async fn docker_image_pull(image: String) -> CommandOutput {
    run_command("docker", &["pull", &image])
}

#[tauri::command]
async fn docker_image_remove(image_id: String, force: Option<bool>) -> CommandOutput {
    let mut builder = ArgsBuilder::new(&["rmi"]);
    builder
        .add_flag("-f", force.unwrap_or(false))
        .add(&image_id);
    run_with_builder("docker", &builder)
}

// ========== 数据卷操作命令 ==========

#[tauri::command]
async fn docker_volume_create(name: String) -> CommandOutput {
    run_command("docker", &["volume", "create", &name])
}

#[tauri::command]
async fn docker_volume_remove(name: String, force: Option<bool>) -> CommandOutput {
    let mut builder = ArgsBuilder::new(&["volume", "rm"]);
    builder
        .add_flag("-f", force.unwrap_or(false))
        .add(&name);
    run_with_builder("docker", &builder)
}

// ========== 网络操作命令 ==========

#[tauri::command]
async fn docker_network_create(name: String, driver: Option<String>) -> CommandOutput {
    let mut builder = ArgsBuilder::new(&["network", "create"]);
    builder
        .add_opt("--driver", driver)
        .add(&name);
    run_with_builder("docker", &builder)
}

#[tauri::command]
async fn docker_network_remove(name: String) -> CommandOutput {
    run_command("docker", &["network", "rm", &name])
}

// ========== 应用入口 ==========

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            // Colima 命令
            colima_status,
            colima_list,
            colima_start,
            colima_stop,
            colima_delete,
            // Docker 查询命令
            docker_container_list,
            docker_image_list,
            docker_volume_list,
            docker_network_list,
            docker_info,
            docker_disk_usage,
            docker_stats,
            // 容器操作命令
            docker_container_start,
            docker_container_stop,
            docker_container_restart,
            docker_container_remove,
            docker_container_logs,
            // 镜像操作命令
            docker_image_pull,
            docker_image_remove,
            // 数据卷操作命令
            docker_volume_create,
            docker_volume_remove,
            // 网络操作命令
            docker_network_create,
            docker_network_remove,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
