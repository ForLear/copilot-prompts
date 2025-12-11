import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { GitHubClient, GitHubPromptData } from './githubClient';

interface PromptData {
    id: string;
    type: 'agent' | 'prompt';
    category: string;
    title: string;
    description: string;
    path: string;
    tags: string[];
    default: boolean;
}

export class ConfigManager {
    private selectedPrompts: Set<string>;
    private readonly STORAGE_KEY = 'selectedPrompts';
    private prompts: PromptData[] = [];
    private githubClient: GitHubClient;
    private projectDocs: string = '';
    private isLoading: boolean = false;

    constructor(private context: vscode.ExtensionContext, private outputChannel?: vscode.OutputChannel) {
        this.githubClient = new GitHubClient(outputChannel);
        
        // 从存储中恢复选中状态
        const stored = context.workspaceState.get<string[]>(this.STORAGE_KEY);
        if (stored) {
            this.selectedPrompts = new Set(stored);
        } else {
            this.selectedPrompts = new Set();
        }

        // 初始化时加载配置
        this.initialize();
    }

    /**
     * 初始化：从 GitHub 加载配置
     */
    private async initialize(): Promise<void> {
        if (this.isLoading) {
            return;
        }

        try {
            this.isLoading = true;
            this.outputChannel?.appendLine('正在从 GitHub 加载配置...');

            // 并行加载配置列表和项目文档
            const [prompts, docs] = await Promise.all([
                this.githubClient.fetchPromptsList(),
                this.githubClient.fetchProjectDocs()
            ]);

            this.prompts = prompts;
            this.projectDocs = docs;

            // 如果没有选中任何配置，选择默认配置
            if (this.selectedPrompts.size === 0) {
                const defaults = this.prompts.filter(p => p.default).map(p => p.id);
                this.selectedPrompts = new Set(defaults);
                this.saveState();
            }

            this.outputChannel?.appendLine(`✅ 成功加载 ${prompts.length} 个配置`);
        } catch (error) {
            this.outputChannel?.appendLine(`⚠️ 加载配置失败，使用降级模式: ${error}`);
            // 使用降级配置
            this.prompts = this.getFallbackPrompts();
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * 刷新配置（从 GitHub 重新加载）
     */
    async refresh(): Promise<void> {
        this.githubClient.clearCache();
        await this.initialize();
    }

    getAllPrompts(): PromptData[] {
        return this.prompts;
    }

    getSelectedPrompts(): string[] {
        return Array.from(this.selectedPrompts);
    }

    setSelectedPrompts(ids: string[]): void {
        this.selectedPrompts = new Set(ids);
        this.saveState();
    }

    togglePrompt(id: string): void {
        if (this.selectedPrompts.has(id)) {
            this.selectedPrompts.delete(id);
        } else {
            this.selectedPrompts.add(id);
        }
        this.saveState();
    }

    selectAll(): void {
        this.selectedPrompts = new Set(this.prompts.map(p => p.id));
        this.saveState();
    }

    clearAll(): void {
        this.selectedPrompts.clear();
        this.saveState();
    }

    private saveState(): void {
        this.context.workspaceState.update(this.STORAGE_KEY, this.getSelectedPrompts());
    }

    async applyGlobal(): Promise<{ success: boolean; count: number }> {
        const selected = this.getSelectedPrompts();
        if (selected.length === 0) {
            throw new Error('请至少选择一个配置');
        }

        const selectedPrompts = this.prompts.filter(p => selected.includes(p.id));

        // 获取 prompts 目录路径
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            throw new Error('请先打开一个工作区');
        }

        const config = vscode.workspace.getConfiguration('copilotPrompts');
        const configuredPath = config.get<string>('promptsPath');
        
        // 智能查找 prompts 目录
        const possiblePaths = [
            configuredPath ? path.resolve(workspaceFolder.uri.fsPath, configuredPath) : null,
            path.join(workspaceFolder.uri.fsPath, 'copilot-prompts'),
            path.resolve(workspaceFolder.uri.fsPath, '../copilot-prompts'),
            workspaceFolder.uri.fsPath  // 当前目录本身（如果包含 agents/common 等）
        ].filter(Boolean) as string[];

        let promptsDir: string | undefined;
        for (const testPath of possiblePaths) {
            if (fs.existsSync(testPath) && (
                fs.existsSync(path.join(testPath, 'agents')) ||
                fs.existsSync(path.join(testPath, 'common')) ||
                fs.existsSync(path.join(testPath, 'industry'))
            )) {
                promptsDir = testPath;
                break;
            }
        }

        if (!promptsDir) {
            throw new Error(`找不到 Prompts 目录。已尝试:\n${possiblePaths.join('\n')}`);
        }

        // 生成配置内容
        let content = '# AI 开发指南 (全局配置)\n\n';
        content += '> 本文件自动生成，仅在本机生效，不会提交到 Git\n\n';
        content += '---\n\n';

        for (const prompt of selectedPrompts) {
            const filePath = path.join(promptsDir, prompt.path);
            if (fs.existsSync(filePath)) {
                content += `---\n\n`;
                content += `<!-- Source: ${prompt.path} -->\n\n`;
                content += fs.readFileSync(filePath, 'utf-8');
                content += '\n\n';
            }
        }

        content += '---\n\n';
        content += '## 📋 应用的 Prompt 列表\n\n';
        for (const prompt of selectedPrompts) {
            content += `- **${prompt.title}** (${prompt.path})\n`;
            content += `  - ${prompt.description}\n`;
            content += `  - 标签: ${prompt.tags.join(', ')}\n`;
        }

        const now = new Date();
        content += `\n生成时间: ${now.toLocaleString('zh-CN')}\n`;
        content += `配置范围: 全局 (用户级)\n`;

        // 写入全局配置文件
        const globalConfigDir = path.join(process.env.HOME || process.env.USERPROFILE || '', '.vscode');
        if (!fs.existsSync(globalConfigDir)) {
            fs.mkdirSync(globalConfigDir, { recursive: true });
        }

        const globalConfigPath = path.join(globalConfigDir, 'copilot-instructions.md');
        
        // 备份旧文件
        if (fs.existsSync(globalConfigPath)) {
            const backupPath = `${globalConfigPath}.backup.${Date.now()}`;
            fs.copyFileSync(globalConfigPath, backupPath);
        }

        fs.writeFileSync(globalConfigPath, content, 'utf-8');

        return { success: true, count: selectedPrompts.length };
    }

    async applyConfig(): Promise<{ success: boolean; count: number }> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            throw new Error('请先打开一个工作区');
        }

        const selected = this.getSelectedPrompts();
        if (selected.length === 0) {
            throw new Error('请至少选择一个配置');
        }

        const selectedPrompts = this.prompts.filter(p => selected.includes(p.id));

        // 生成配置内容
        let content = '# AI 开发指南\n\n';
        content += '> 本文件自动生成，请勿手动编辑\n';
        content += '> 配置从 GitHub 仓库动态获取: https://github.com/ForLear/copilot-prompts\n\n';
        content += '---\n\n';

        // 添加项目文档汇总（优化生成质量）
        if (this.projectDocs) {
            content += '# 📚 项目文档汇总（优化 Copilot 生成质量）\n\n';
            content += this.projectDocs;
            content += '\n\n---\n\n';
        }

        // 添加选中的 prompts 内容
        for (const prompt of selectedPrompts) {
            try {
                // 从 GitHub 获取最新内容
                const promptContent = await this.githubClient.fetchFileContent(prompt.path);
                
                content += `---\n\n`;
                content += `<!-- Source: ${prompt.path} -->\n\n`;
                content += promptContent;
                content += '\n\n';
            } catch (error) {
                this.outputChannel?.appendLine(`⚠️ 获取 ${prompt.path} 失败: ${error}`);
            }
        }

        content += '---\n\n';
        content += '## 📋 应用的 Prompt 列表\n\n';
        for (const prompt of selectedPrompts) {
            content += `- **${prompt.title}** (${prompt.path})\n`;
            content += `  - ${prompt.description}\n`;
            content += `  - 标签: ${prompt.tags.join(', ')}\n`;
        }

        const now = new Date();
        content += `\n生成时间: ${now.toLocaleString('zh-CN')}\n`;
        content += `配置来源: GitHub (动态获取)\n`;

        // 写入文件
        const outputDir = path.join(workspaceFolder.uri.fsPath, '.github');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputPath = path.join(outputDir, 'copilot-instructions.md');
        
        // 备份旧文件
        if (fs.existsSync(outputPath)) {
            const backupPath = `${outputPath}.backup.${Date.now()}`;
            fs.copyFileSync(outputPath, backupPath);
        }

        fs.writeFileSync(outputPath, content, 'utf-8');

        return { success: true, count: selectedPrompts.length };
    }

    /**
     * 获取降级配置
     */
    private getFallbackPrompts(): PromptData[] {
        return [
            {
                id: 'vitasage-agent',
                type: 'agent',
                category: 'agents',
                title: 'VitaSage Agent',
                description: 'VitaSage 工业配方管理系统专用',
                path: 'agents/vitasage.agent.md',
                tags: ['vue3', 'typescript', 'element-plus', 'logicflow'],
                default: true
            },
            {
                id: 'vue3-agent',
                type: 'agent',
                category: 'agents',
                title: 'Vue 3 Agent',
                description: 'Vue 3 + TypeScript + Composition API',
                path: 'agents/vue3.agent.md',
                tags: ['vue3', 'typescript', 'composition-api'],
                default: true
            },
            {
                id: 'typescript-agent',
                type: 'agent',
                category: 'agents',
                title: 'TypeScript Agent',
                description: 'TypeScript 严格模式和类型安全',
                path: 'agents/typescript.agent.md',
                tags: ['typescript', 'type-safety'],
                default: true
            },
            {
                id: 'i18n-agent',
                type: 'agent',
                category: 'agents',
                title: 'i18n Agent',
                description: '国际化最佳实践',
                path: 'agents/i18n.agent.md',
                tags: ['i18n', 'vue-i18n'],
                default: true
            }
        ];
    }
}
