import * as vscode from 'vscode';

export interface GitHubPromptData {
    id: string;
    type: 'agent' | 'prompt';
    category: string;
    title: string;
    description: string;
    path: string;
    tags: string[];
    default: boolean;
    content?: string;
}

export interface GitHubConfig {
    owner: string;
    repo: string;
    branch: string;
}

export class GitHubClient {
    private readonly defaultConfig: GitHubConfig = {
        owner: 'ForLear',
        repo: 'copilot-prompts',
        branch: 'main'
    };

    private cache: Map<string, { data: any; timestamp: number }> = new Map();
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 分钟缓存

    constructor(private outputChannel?: vscode.OutputChannel) {}

    /**
     * 从 GitHub 获取配置列表
     */
    async fetchPromptsList(config?: Partial<GitHubConfig>): Promise<GitHubPromptData[]> {
        const fullConfig = { ...this.defaultConfig, ...config };
        const cacheKey = 'prompts-list';

        // 检查缓存
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            this.log('使用缓存的配置列表');
            return cached;
        }

        try {
            this.log('从 GitHub 获取配置列表...');
            
            // 获取 agents 和 prompts 目录
            const [agents, prompts] = await Promise.all([
                this.fetchDirectoryFiles(fullConfig, 'agents'),
                this.fetchPromptsFromCategories(fullConfig)
            ]);

            const allPrompts = [...agents, ...prompts];
            this.setCache(cacheKey, allPrompts);
            
            this.log(`成功获取 ${allPrompts.length} 个配置`);
            return allPrompts;
        } catch (error) {
            this.log(`获取配置失败: ${error}`, true);
            return this.getFallbackPrompts();
        }
    }

    /**
     * 获取单个文件内容
     */
    async fetchFileContent(filePath: string, config?: Partial<GitHubConfig>): Promise<string> {
        const fullConfig = { ...this.defaultConfig, ...config };
        const cacheKey = `file-${filePath}`;

        const cached = this.getFromCache(cacheKey);
        if (cached) {
            return cached;
        }

        try {
            const url = `https://raw.githubusercontent.com/${fullConfig.owner}/${fullConfig.repo}/${fullConfig.branch}/${filePath}`;
            this.log(`获取文件: ${url}`);

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const content = await response.text();
            this.setCache(cacheKey, content);
            return content;
        } catch (error) {
            this.log(`获取文件失败: ${filePath} - ${error}`, true);
            throw error;
        }
    }

    /**
     * 获取目录下的文件列表
     */
    private async fetchDirectoryFiles(config: GitHubConfig, dirPath: string): Promise<GitHubPromptData[]> {
        try {
            const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${dirPath}?ref=${config.branch}`;
            this.log(`获取目录: ${apiUrl}`);

            const response = await fetch(apiUrl, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'VSCode-Copilot-Prompts-Manager'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const files = await response.json() as any[];
            const mdFiles = files.filter((file: any) => 
                file.name.endsWith('.md') && file.type === 'file'
            );

            const prompts: GitHubPromptData[] = [];
            
            for (const file of mdFiles) {
                const metadata = await this.parseFileMetadata(file.path, config);
                if (metadata) {
                    prompts.push(metadata);
                }
            }

            return prompts;
        } catch (error) {
            this.log(`获取目录失败: ${dirPath} - ${error}`, true);
            return [];
        }
    }

    /**
     * 从多个分类目录获取 prompts
     */
    private async fetchPromptsFromCategories(config: GitHubConfig): Promise<GitHubPromptData[]> {
        const categories = ['common', 'vue', 'industry'];
        const allPrompts: GitHubPromptData[] = [];

        for (const category of categories) {
            const categoryPrompts = await this.fetchDirectoryFiles(config, category);
            allPrompts.push(...categoryPrompts);
        }

        return allPrompts;
    }

    /**
     * 解析文件元数据（从文件内容中提取）
     */
    private async parseFileMetadata(filePath: string, config: GitHubConfig): Promise<GitHubPromptData | null> {
        try {
            const content = await this.fetchFileContent(filePath, config);
            const fileName = filePath.split('/').pop() || '';
            const isAgent = filePath.includes('agents/');
            const category = filePath.split('/')[0];

            // 从文件名生成 ID
            const id = fileName.replace(/\.(agent\.)?md$/, '');

            // 从 frontmatter 或文件内容提取元数据
            const metadata = this.extractMetadata(content, fileName);

            return {
                id,
                type: isAgent ? 'agent' : 'prompt',
                category,
                title: metadata.title || this.generateTitle(fileName),
                description: metadata.description || this.extractDescription(content),
                path: filePath,
                tags: metadata.tags || this.extractTags(content),
                default: metadata.default || false,
                content
            };
        } catch (error) {
            this.log(`解析文件元数据失败: ${filePath}`, true);
            return null;
        }
    }

    /**
     * 从文件内容提取元数据
     */
    private extractMetadata(content: string, fileName: string): Partial<GitHubPromptData> {
        const metadata: Partial<GitHubPromptData> = {};

        // 尝试解析 YAML frontmatter (---\n...\n---)
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (frontmatterMatch) {
            const frontmatter = frontmatterMatch[1];
            
            // 提取 description
            const descMatch = frontmatter.match(/description:\s*['"](.+?)['"]/);
            if (descMatch) {
                metadata.description = descMatch[1];
            }

            // 提取 tags
            const tagsMatch = frontmatter.match(/tags:\s*\[(.+?)\]/);
            if (tagsMatch) {
                metadata.tags = tagsMatch[1].split(',').map(t => t.trim().replace(/['"]/g, ''));
            }
        }

        // 提取第一个标题作为 title
        const titleMatch = content.match(/^#\s+(.+)$/m);
        if (titleMatch) {
            metadata.title = titleMatch[1];
        }

        return metadata;
    }

    /**
     * 从文件名生成标题
     */
    private generateTitle(fileName: string): string {
        return fileName
            .replace(/\.(agent\.)?md$/, '')
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * 提取描述（第一个段落）
     */
    private extractDescription(content: string): string {
        // 移除 frontmatter
        const withoutFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n/, '');
        
        // 找到第一个非标题段落
        const paragraphMatch = withoutFrontmatter.match(/\n\n([^#\n].+?)(\n\n|$)/);
        if (paragraphMatch) {
            return paragraphMatch[1].substring(0, 100);
        }

        return '';
    }

    /**
     * 从内容提取标签
     */
    private extractTags(content: string): string[] {
        const tags: string[] = [];
        
        // 检测技术栈
        if (content.includes('Vue 3') || content.includes('vue3')) tags.push('vue3');
        if (content.includes('TypeScript')) tags.push('typescript');
        if (content.includes('Element Plus')) tags.push('element-plus');
        if (content.includes('i18n') || content.includes('国际化')) tags.push('i18n');
        
        return tags;
    }

    /**
     * 获取项目文档汇总
     */
    async fetchProjectDocs(config?: Partial<GitHubConfig>): Promise<string> {
        const fullConfig = { ...this.defaultConfig, ...config };
        const cacheKey = 'project-docs';

        const cached = this.getFromCache(cacheKey);
        if (cached) {
            return cached;
        }

        try {
            const docFiles = [
                'README.md',
                'BEST_PRACTICES.md',
                'AGENTS_GUIDE.md',
                'MANAGER_GUIDE.md'
            ];

            const docs = await Promise.all(
                docFiles.map(file => this.fetchFileContent(file, fullConfig).catch(() => ''))
            );

            const summary = this.generateDocsSummary(docFiles, docs);
            this.setCache(cacheKey, summary);
            
            return summary;
        } catch (error) {
            this.log(`获取项目文档失败: ${error}`, true);
            return '';
        }
    }

    /**
     * 生成文档汇总
     */
    private generateDocsSummary(files: string[], contents: string[]): string {
        let summary = '# Copilot Prompts Manager - 项目文档汇总\n\n';
        summary += '> 以下内容从 GitHub 仓库动态获取，用于优化插件生成质量\n\n';

        files.forEach((file, index) => {
            if (contents[index]) {
                summary += `\n---\n\n## 📄 ${file}\n\n`;
                // 只取前 500 字符的关键内容
                const content = contents[index];
                const keySection = this.extractKeySection(content);
                summary += keySection + '\n';
            }
        });

        return summary;
    }

    /**
     * 提取文档的关键部分
     */
    private extractKeySection(content: string): string {
        // 移除 frontmatter
        let cleaned = content.replace(/^---\n[\s\S]*?\n---\n/, '');
        
        // 只保留核心说明，去除详细示例
        const sections = cleaned.split('\n## ');
        if (sections.length > 1) {
            // 保留标题和前两个章节
            return sections.slice(0, 3).join('\n## ').substring(0, 800);
        }
        
        return cleaned.substring(0, 500);
    }

    /**
     * 缓存管理
     */
    private getFromCache(key: string): any | null {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
            return cached.data;
        }
        return null;
    }

    private setCache(key: string, data: any): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    /**
     * 清除缓存
     */
    clearCache(): void {
        this.cache.clear();
        this.log('缓存已清除');
    }

    /**
     * 获取降级配置（网络失败时使用）
     */
    private getFallbackPrompts(): GitHubPromptData[] {
        this.log('使用降级配置 (GitHub 无法访问或网络错误)');
        return [
            // Agents
            {
                id: 'vitasage-agent',
                type: 'agent',
                category: 'agents',
                title: 'VitaSage Agent',
                description: 'VitaSage 工业配方管理系统专用',
                path: 'agents/vitasage.agent.md',
                tags: ['vue3', 'typescript', 'element-plus'],
                default: true
            },
            {
                id: 'vue3-agent',
                type: 'agent',
                category: 'agents',
                title: 'Vue 3 Agent',
                description: 'Vue 3 + TypeScript 通用开发',
                path: 'agents/vue3.agent.md',
                tags: ['vue3', 'typescript'],
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
                default: false
            },
            {
                id: 'i18n-agent',
                type: 'agent',
                category: 'agents',
                title: 'i18n Agent',
                description: '国际化最佳实践',
                path: 'agents/i18n.agent.md',
                tags: ['i18n', 'vue-i18n'],
                default: false
            },
            // Common Prompts
            {
                id: 'typescript-strict',
                type: 'prompt',
                category: 'common',
                title: 'TypeScript 严格模式',
                description: '零 any、严格空检查、完整类型定义',
                path: 'common/typescript-strict.md',
                tags: ['typescript', 'type-safety'],
                default: false
            },
            {
                id: 'i18n-best-practices',
                type: 'prompt',
                category: 'common',
                title: '国际化 (i18n)',
                description: '零硬编码文本，完整国际化方案',
                path: 'common/i18n.md',
                tags: ['i18n', 'vue-i18n'],
                default: false
            },
            // Vue Prompts
            {
                id: 'vue3-typescript',
                type: 'prompt',
                category: 'vue',
                title: 'Vue 3 + TypeScript',
                description: 'Vue 3 Composition API + TypeScript 最佳实践',
                path: 'vue/vue3-typescript.md',
                tags: ['vue3', 'typescript'],
                default: false
            },
            // Industry Prompts
            {
                id: 'vitasage-recipe',
                type: 'prompt',
                category: 'industry',
                title: 'VitaSage 配方系统',
                description: '工业配方管理系统完整开发规范',
                path: 'industry/vitasage-recipe.md',
                tags: ['vue3', 'typescript', 'element-plus'],
                default: false
            }
        ];
    }

    /**
     * 日志输出
     */
    private log(message: string, isError: boolean = false): void {
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}] ${message}`;
        
        if (this.outputChannel) {
            this.outputChannel.appendLine(logMessage);
        }
        
        if (isError) {
            console.error(logMessage);
        } else {
            console.log(logMessage);
        }
    }
}
