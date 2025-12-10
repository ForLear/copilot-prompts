import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface ValidationIssue {
    severity: 'error' | 'warning' | 'info';
    message: string;
    action?: string;
    fix?: () => Promise<void>;
}

export class ConfigValidator {
    private workspaceFolders: readonly vscode.WorkspaceFolder[];

    constructor() {
        this.workspaceFolders = vscode.workspace.workspaceFolders || [];
    }

    /**
     * 检查所有配置问题
     */
    async checkAll(): Promise<ValidationIssue[]> {
        const issues: ValidationIssue[] = [];

        // 检查 1: 多文件夹工作区的配置冲突
        const conflictIssues = await this.checkWorkspaceConflicts();
        issues.push(...conflictIssues);

        // 检查 2: 检查是否有备份文件
        const backupIssues = await this.checkBackupFiles();
        issues.push(...backupIssues);

        // 检查 3: 检查项目配置是否存在
        const missingIssues = await this.checkMissingConfigs();
        issues.push(...missingIssues);

        return issues;
    }

    /**
     * 检查工作区配置冲突
     * 检测是否有多个项目都有 copilot-instructions.md，可能导致第一个生效
     */
    private async checkWorkspaceConflicts(): Promise<ValidationIssue[]> {
        const issues: ValidationIssue[] = [];

        if (this.workspaceFolders.length <= 1) {
            return issues; // 单项目无冲突问题
        }

        const configPaths: { folder: string; path: string }[] = [];

        for (const folder of this.workspaceFolders) {
            const configPath = path.join(folder.uri.fsPath, '.github', 'copilot-instructions.md');
            if (fs.existsSync(configPath)) {
                configPaths.push({
                    folder: folder.name,
                    path: configPath
                });
            }
        }

        if (configPaths.length > 1) {
            const firstFolder = configPaths[0].folder;
            const otherFolders = configPaths.slice(1).map(c => c.folder).join(', ');

            issues.push({
                severity: 'warning',
                message: `⚠️ 检测到多个项目都有配置文件！\n` +
                    `当前生效的是: ${firstFolder}\n` +
                    `其他项目 (${otherFolders}) 的配置可能不会生效。\n` +
                    `建议：每个项目使用独立配置，避免冲突。`,
                action: '查看详情',
                fix: async () => {
                    const items = configPaths.map((c, index) => ({
                        label: `${index === 0 ? '$(check) ' : ''}${c.folder}`,
                        description: index === 0 ? '(当前生效)' : '(可能不生效)',
                        detail: c.path
                    }));

                    await vscode.window.showQuickPick(items, {
                        title: '工作区配置冲突',
                        placeHolder: '以下项目都有 copilot-instructions.md'
                    });
                }
            });
        }

        return issues;
    }

    /**
     * 检查备份文件
     */
    private async checkBackupFiles(): Promise<ValidationIssue[]> {
        const issues: ValidationIssue[] = [];

        for (const folder of this.workspaceFolders) {
            const backupPath = path.join(folder.uri.fsPath, '.github', 'copilot-instructions.md.backup');
            if (fs.existsSync(backupPath)) {
                issues.push({
                    severity: 'info',
                    message: `ℹ️ 发现备份文件: ${folder.name}/.github/copilot-instructions.md.backup\n` +
                        `如需恢复，可以重命名回 copilot-instructions.md`,
                    action: '恢复备份',
                    fix: async () => {
                        const originalPath = path.join(folder.uri.fsPath, '.github', 'copilot-instructions.md');
                        const choice = await vscode.window.showWarningMessage(
                            `确认恢复 ${folder.name} 的配置备份？`,
                            { modal: true },
                            '恢复',
                            '取消'
                        );

                        if (choice === '恢复') {
                            fs.renameSync(backupPath, originalPath);
                            vscode.window.showInformationMessage(`✅ 已恢复 ${folder.name} 的配置`);
                        }
                    }
                });
            }
        }

        return issues;
    }

    /**
     * 检查缺失的配置
     */
    private async checkMissingConfigs(): Promise<ValidationIssue[]> {
        const issues: ValidationIssue[] = [];

        for (const folder of this.workspaceFolders) {
            const configPath = path.join(folder.uri.fsPath, '.github', 'copilot-instructions.md');
            if (!fs.existsSync(configPath)) {
                issues.push({
                    severity: 'info',
                    message: `ℹ️ ${folder.name} 未配置 copilot-instructions.md\n` +
                        `建议：为此项目单独配置 Copilot Prompts`,
                    action: '立即配置'
                });
            }
        }

        return issues;
    }

    /**
     * 显示检查结果
     */
    async showResults(issues: ValidationIssue[]): Promise<void> {
        if (issues.length === 0) {
            vscode.window.showInformationMessage('✅ 未发现配置问题');
            return;
        }

        // 统计问题数量
        const errors = issues.filter(i => i.severity === 'error').length;
        const warnings = issues.filter(i => i.severity === 'warning').length;
        const infos = issues.filter(i => i.severity === 'info').length;

        let summary = '🔍 配置检查结果:\n';
        if (errors > 0) summary += `\n❌ 错误: ${errors} 个`;
        if (warnings > 0) summary += `\n⚠️ 警告: ${warnings} 个`;
        if (infos > 0) summary += `\nℹ️ 信息: ${infos} 个`;

        // 显示问题列表
        const items = issues.map(issue => ({
            label: issue.message.split('\n')[0],
            detail: issue.message.split('\n').slice(1).join('\n'),
            description: issue.action || '',
            issue: issue
        }));

        const selected = await vscode.window.showQuickPick(items, {
            title: summary,
            placeHolder: '选择一个问题查看详情或修复',
            matchOnDetail: true
        });

        if (selected && selected.issue.fix) {
            await selected.issue.fix();
        }
    }

    /**
     * 快速修复：备份第一个文件夹的配置
     */
    async backupFirstFolderConfig(): Promise<boolean> {
        if (this.workspaceFolders.length === 0) {
            return false;
        }

        const firstFolder = this.workspaceFolders[0];
        const configPath = path.join(firstFolder.uri.fsPath, '.github', 'copilot-instructions.md');
        
        if (!fs.existsSync(configPath)) {
            vscode.window.showWarningMessage(`${firstFolder.name} 没有配置文件`);
            return false;
        }

        const backupPath = configPath + '.backup';
        
        const choice = await vscode.window.showWarningMessage(
            `确认备份 ${firstFolder.name} 的配置文件？\n` +
            `这将避免影响其他项目`,
            { modal: true },
            '备份',
            '取消'
        );

        if (choice === '备份') {
            fs.renameSync(configPath, backupPath);
            vscode.window.showInformationMessage(`✅ 已备份 ${firstFolder.name} 的配置`);
            return true;
        }

        return false;
    }
}
