import { StandardsManager } from '../core/standardsManager.js';
import { ConsoleLogger } from '../core/types.js';

/**
 * 预设场景定义
 */
const PRESETS = {
    'vue3-component': {
        name: 'Vue 3 组件开发',
        fileType: 'vue',
        imports: ['vue', 'element-plus'],
        scenario: '组件开发',
        description: '开发 Vue 3 单文件组件，包含 Composition API 和 Element Plus'
    },
    'vue3-form': {
        name: 'Vue 3 表单开发',
        fileType: 'vue',
        imports: ['vue', 'element-plus'],
        scenario: '表单组件',
        description: 'Element Plus 表单组件开发，包含验证和国际化'
    },
    'vue3-table': {
        name: 'Vue 3 表格开发',
        fileType: 'vue',
        imports: ['vue', 'element-plus'],
        scenario: '表格组件',
        description: 'Element Plus 表格组件开发，包含分页和操作'
    },
    'pinia-store': {
        name: 'Pinia 状态管理',
        fileType: 'ts',
        imports: ['vue', 'pinia'],
        scenario: '状态管理',
        description: 'Pinia store 定义，包含 actions、getters 和持久化'
    },
    'api-call': {
        name: 'API 调用层',
        fileType: 'ts',
        imports: ['axios'],
        scenario: 'API 调用',
        description: 'RESTful API 调用封装，包含错误处理和类型定义'
    },
    'typescript-strict': {
        name: 'TypeScript 严格模式',
        fileType: 'ts',
        imports: [],
        scenario: '类型定义',
        description: 'TypeScript 严格类型定义和类型守卫'
    },
    'i18n': {
        name: '国际化开发',
        fileType: 'vue',
        imports: ['vue', 'vue-i18n'],
        scenario: '国际化',
        description: 'Vue I18n 多语言支持，包含翻译文件管理'
    },
    'composable': {
        name: 'Vue 3 Composable',
        fileType: 'ts',
        imports: ['vue'],
        scenario: '可组合函数',
        description: 'Vue 3 组合式函数开发，复用逻辑'
    }
} as const;

type PresetId = keyof typeof PRESETS;

/**
 * 预设场景快捷工具
 * 使用预定义的场景配置快速获取规范
 */
export async function usePreset(args: {
    preset: string;
    customImports?: string[];
}): Promise<{
    content: Array<{ type: string; text: string }>;
}> {
    const logger = new ConsoleLogger();
    const manager = new StandardsManager();
    
    try {
        // 验证预设
        if (!(args.preset in PRESETS)) {
            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify({
                        error: `未知的预设: ${args.preset}`,
                        availablePresets: Object.keys(PRESETS).map(id => ({
                            id,
                            name: PRESETS[id as PresetId].name,
                            description: PRESETS[id as PresetId].description
                        }))
                    }, null, 2)
                }]
            };
        }

        const preset = PRESETS[args.preset as PresetId];
        logger.log(`🎯 使用预设: ${preset.name}`);

        // 合并自定义导入
        const imports = args.customImports 
            ? [...preset.imports, ...args.customImports]
            : [...preset.imports];  // 创建新数组避免只读问题

        // 获取相关规范
        const standards = manager.getRelevantStandards({
            fileType: preset.fileType,
            imports: imports.length > 0 ? imports : undefined,
            scenario: preset.scenario
        });

        const combinedContent = manager.combineStandards(standards);

        return {
            content: [{
                type: 'text',
                text: JSON.stringify({
                    success: true,
                    preset: {
                        id: args.preset,
                        name: preset.name,
                        description: preset.description
                    },
                    applied: {
                        fileType: preset.fileType,
                        imports,
                        scenario: preset.scenario
                    },
                    standards: standards,
                    content: combinedContent,
                    stats: {
                        standardsCount: standards.length,
                        contentLength: combinedContent.length,
                        estimatedTokens: Math.ceil(combinedContent.length / 4)
                    }
                }, null, 2)
            }]
        };
    } catch (error) {
        logger.error(`使用预设失败: ${error}`);
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

/**
 * 列出所有可用预设
 */
export async function listPresets(): Promise<{
    content: Array<{ type: string; text: string }>;
}> {
    const presetList = Object.entries(PRESETS).map(([id, preset]) => ({
        id,
        name: preset.name,
        description: preset.description,
        fileType: preset.fileType,
        imports: preset.imports,
        scenario: preset.scenario
    }));

    return {
        content: [{
            type: 'text',
            text: JSON.stringify({
                success: true,
                total: presetList.length,
                presets: presetList,
                usage: '使用方式: 调用 use_preset 工具并指定 preset 参数'
            }, null, 2)
        }]
    };
}
