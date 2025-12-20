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

// ========== Colima 命令 ==========

/// 获取 Colima 状态 (JSON 格式)
#[tauri::command]
fn colima_status() -> CommandOutput {
    run_command("colima", &["status", "-p", "default", "--json"])
}

/// 获取 Colima 列表 (JSON 格式)
#[tauri::command]
fn colima_list() -> CommandOutput {
    run_command("colima", &["list", "--json"])
}

/// 启动 Colima
#[tauri::command]
async fn colima_start(cpu: Option<u32>, memory: Option<u32>, disk: Option<u32>) -> CommandOutput {
    let mut args = vec!["start"];
    
    let cpu_str;
    let memory_str;
    let disk_str;
    
    if let Some(c) = cpu {
        cpu_str = c.to_string();
        args.push("--cpu");
        args.push(&cpu_str);
    }
    if let Some(m) = memory {
        memory_str = m.to_string();
        args.push("--memory");
        args.push(&memory_str);
    }
    if let Some(d) = disk {
        disk_str = d.to_string();
        args.push("--disk");
        args.push(&disk_str);
    }
    
    run_command("colima", &args)
}

/// 停止 Colima
#[tauri::command]
async fn colima_stop() -> CommandOutput {
    run_command("colima", &["stop"])
}

/// 删除 Colima 实例
#[tauri::command]
async fn colima_delete(force: Option<bool>) -> CommandOutput {
    let mut args = vec!["delete"];
    if force.unwrap_or(false) {
        args.push("--force");
    }
    run_command("colima", &args)
}

// ========== Docker 命令 ==========

/// 获取容器列表 (JSON 格式)
#[tauri::command]
fn docker_container_list(all: Option<bool>) -> CommandOutput {
    let mut args = vec!["ps", "--format", "json"];
    if all.unwrap_or(true) {
        args.insert(1, "-a");
    }
    run_command("docker", &args)
}

/// 获取镜像列表 (JSON 格式)
#[tauri::command]
fn docker_image_list() -> CommandOutput {
    run_command("docker", &["images", "--format", "json"])
}

/// 获取数据卷列表 (JSON 格式)
#[tauri::command]
fn docker_volume_list() -> CommandOutput {
    run_command("docker", &["volume", "ls", "--format", "json"])
}

/// 获取网络列表 (JSON 格式)
#[tauri::command]
fn docker_network_list() -> CommandOutput {
    run_command("docker", &["network", "ls", "--format", "json"])
}

/// 获取 Docker 系统信息 (JSON 格式)
#[tauri::command]
fn docker_info() -> CommandOutput {
    run_command("docker", &["info", "--format", "json"])
}

/// 获取 Docker 磁盘使用情况 (JSON 格式)
#[tauri::command]
fn docker_disk_usage() -> CommandOutput {
    run_command("docker", &["system", "df", "--format", "json"])
}

/// 获取容器资源使用统计 (JSON 格式)
#[tauri::command]
fn docker_stats() -> CommandOutput {
    run_command("docker", &["stats", "--no-stream", "--format", "json"])
}

// ========== 容器操作命令 ==========

/// 启动容器
#[tauri::command]
async fn docker_container_start(container_id: String) -> CommandOutput {
    run_command("docker", &["start", &container_id])
}

/// 停止容器
#[tauri::command]
async fn docker_container_stop(container_id: String) -> CommandOutput {
    run_command("docker", &["stop", &container_id])
}

/// 重启容器
#[tauri::command]
async fn docker_container_restart(container_id: String) -> CommandOutput {
    run_command("docker", &["restart", &container_id])
}

/// 删除容器
#[tauri::command]
async fn docker_container_remove(container_id: String, force: Option<bool>) -> CommandOutput {
    let mut args = vec!["rm"];
    if force.unwrap_or(false) {
        args.push("-f");
    }
    args.push(&container_id);
    run_command("docker", &args)
}

/// 获取容器日志
#[tauri::command]
fn docker_container_logs(container_id: String, tail: Option<u32>) -> CommandOutput {
    let tail_str;
    let mut args = vec!["logs"];
    if let Some(n) = tail {
        tail_str = n.to_string();
        args.push("--tail");
        args.push(&tail_str);
    }
    args.push(&container_id);
    run_command("docker", &args)
}

// ========== 镜像操作命令 ==========

/// 拉取镜像
#[tauri::command]
async fn docker_image_pull(image: String) -> CommandOutput {
    run_command("docker", &["pull", &image])
}

/// 删除镜像
#[tauri::command]
async fn docker_image_remove(image_id: String, force: Option<bool>) -> CommandOutput {
    let mut args = vec!["rmi"];
    if force.unwrap_or(false) {
        args.push("-f");
    }
    args.push(&image_id);
    run_command("docker", &args)
}

// ========== 数据卷操作命令 ==========

/// 创建数据卷
#[tauri::command]
async fn docker_volume_create(name: String) -> CommandOutput {
    run_command("docker", &["volume", "create", &name])
}

/// 删除数据卷
#[tauri::command]
async fn docker_volume_remove(name: String, force: Option<bool>) -> CommandOutput {
    let mut args = vec!["volume", "rm"];
    if force.unwrap_or(false) {
        args.push("-f");
    }
    args.push(&name);
    run_command("docker", &args)
}

// ========== 网络操作命令 ==========

/// 创建网络
#[tauri::command]
async fn docker_network_create(name: String, driver: Option<String>) -> CommandOutput {
    let mut args = vec!["network", "create"];
    let driver_val;
    if let Some(d) = driver {
        driver_val = d;
        args.push("--driver");
        args.push(&driver_val);
    }
    args.push(&name);
    run_command("docker", &args)
}

/// 删除网络
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
