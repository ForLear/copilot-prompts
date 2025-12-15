import * as fs from 'fs';
import * as path from 'path';
import { SmartAgentMatcher } from '../core/smartAgentMatcher.js';
import { ProjectFeatures, ConsoleLogger } from '../core/types.js';

/**
 * 分析项目工具（Phase 4 增强：支持自动检测）
 */
export async function analyzeProject(args: { projectPath?: string }): Promise<{
    content: Array<{ type: string; text: string }>;
}> {
    const logger = new ConsoleLogger();
    
    try {
        // 自动检测项目路径
        let projectPath = args.projectPath;
        
        if (!projectPath) {
            // 使用当前工作目录
            projectPath = process.cwd();
            logger.log(`📍 未指定路径，使用当前目录: ${projectPath}`);
        }
        
        // 验证路径
        if (!fs.existsSync(projectPath)) {
            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify({
                        error: `项目路径不存在: ${projectPath}`
                    }, null, 2)
                }]
            };
        }

        // 创建匹配器并分析项目
        const matcher = new SmartAgentMatcher(logger);
        
        // 模拟 WorkspaceFolder 接口
        const workspaceFolder = {
            uri: { fsPath: projectPath },
            name: path.basename(projectPath),
            index: 0
        };

        const features = await matcher.analyzeProject(workspaceFolder as any);

        // 返回分析结果
        return {
            content: [{
                type: 'text',
                text: JSON.stringify({
                    success: true,
                    projectPath: projectPath,
                    projectName: path.basename(projectPath),
                    autoDetected: !args.projectPath,
                    features: {
                        projectType: features.projectType,
                        frameworks: features.frameworks,
                        languages: features.languages,
                        tools: features.tools,
                        keywords: features.keywords
                    },
                    summary: `检测到 ${features.projectType} 项目，使用 ${features.frameworks.join(', ')} 框架`
                }, null, 2)
            }]
        };
    } catch (error) {
        logger.error(`分析项目失败: ${error}`);
        return {
            content: [{
                type: 'text',
                text: JSON.stringify({
                    error: error instanceof Error ? error.message : String(error)
                }, null, 2)
            }]
        };
    }
}
