import * as fs from 'fs';
import * as path from 'path';
import glob from 'fast-glob';

/**
 * 国际化配置信息
 */
export interface I18nConfig {
    enabled: boolean;           // 是否启用了国际化
    type: 'vue-i18n' | 'flutter-intl' | 'react-i18n' | 'custom' | 'none';  // 国际化方案类型
    configFiles: string[];      // 配置文件路径
    messageFiles: string[];     // 消息文件路径
    method: string;             // 使用方法（如 $t、S.of(context)）
    example: string;            // 使用示例
    tips: string[];             // 提示信息
}

/**
 * 国际化检测器
 * 支持检测 Vue、Flutter、React 等项目的国际化配置
 */
export class I18nDetector {
    /**
     * 检测项目的国际化配置
     */
    static async detect(projectPath: string): Promise<I18nConfig> {
        // 检测 package.json（前端项目）
        const packageJsonPath = path.join(projectPath, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            return this.detectFrontendI18n(projectPath, packageJsonPath);
        }

        // 检测 pubspec.yaml（Flutter 项目）
        const pubspecPath = path.join(projectPath, 'pubspec.yaml');
        if (fs.existsSync(pubspecPath)) {
            return this.detectFlutterI18n(projectPath, pubspecPath);
        }

        // 未检测到国际化
        return {
            enabled: false,
            type: 'none',
            configFiles: [],
            messageFiles: [],
            method: '',
            example: '',
            tips: ['项目未配置国际化，建议添加中英双语支持']
        };
    }

    /**
     * 检测前端项目的国际化配置（Vue/React）
     */
    private static detectFrontendI18n(projectPath: string, packageJsonPath: string): I18nConfig {
        const content = fs.readFileSync(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(content);
        const allDeps = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies
        };

        // 检测 vue-i18n
        if (allDeps['vue-i18n']) {
            return this.detectVueI18n(projectPath);
        }

        // 检测 react-i18next
        if (allDeps['react-i18next'] || allDeps['i18next']) {
            return this.detectReactI18n(projectPath);
        }

        // 检测 react-intl
        if (allDeps['react-intl']) {
            return this.detectReactIntl(projectPath);
        }

        // 检测自定义国际化方案
        return this.detectCustomI18n(projectPath);
    }

    /**
     * 检测 vue-i18n 配置
     */
    private static detectVueI18n(projectPath: string): I18nConfig {
        const configFiles: string[] = [];
        const messageFiles: string[] = [];

        // 查找配置文件
        const possibleConfigPaths = [
            'src/i18n/index.ts',
            'src/i18n/index.js',
            'src/locales/index.ts',
            'src/locales/index.js',
            'i18n.config.ts',
            'i18n.config.js'
        ];

        for (const configPath of possibleConfigPaths) {
            const fullPath = path.join(projectPath, configPath);
            if (fs.existsSync(fullPath)) {
                configFiles.push(configPath);
            }
        }

        // 查找消息文件
        const possibleMessageDirs = ['src/i18n', 'src/locales', 'src/lang'];
        for (const dir of possibleMessageDirs) {
            const fullDir = path.join(projectPath, dir);
            if (fs.existsSync(fullDir)) {
                const files = fs.readdirSync(fullDir);
                for (const file of files) {
                    if (/^(zh|en|ja|ko|fr|de|es).*\.(ts|js|json)$/.test(file)) {
                        messageFiles.push(path.join(dir, file));
                    }
                }
            }
        }

        return {
            enabled: true,
            type: 'vue-i18n',
            configFiles,
            messageFiles,
            method: '$t()',
            example: `{{ $t('common.save') }} 或 :label="$t('user.username')"`,
            tips: [
                '使用命名空间格式：$t("common.save")',
                '所有按钮、标签、提示文字必须使用 $t()',
                '表单验证规则的 message 也需要国际化',
                '确保 zh-CN.ts 和 en-US.ts 中的键名完全一致'
            ]
        };
    }

    /**
     * 检测 react-i18next 配置
     */
    private static detectReactI18n(projectPath: string): I18nConfig {
        const configFiles: string[] = [];
        const messageFiles: string[] = [];

        // 查找配置文件
        const possibleConfigPaths = [
            'src/i18n.ts',
            'src/i18n.js',
            'src/i18n/config.ts',
            'src/i18n/config.js'
        ];

        for (const configPath of possibleConfigPaths) {
            const fullPath = path.join(projectPath, configPath);
            if (fs.existsSync(fullPath)) {
                configFiles.push(configPath);
            }
        }

        // 查找翻译文件
        const possibleMessageDirs = ['public/locales', 'src/locales', 'src/i18n'];
        for (const dir of possibleMessageDirs) {
            const fullDir = path.join(projectPath, dir);
            if (fs.existsSync(fullDir)) {
                const pattern = path.join(fullDir, '**/*.json');
                try {
                    const files = glob.sync(pattern);
                    messageFiles.push(...files.map(f => path.relative(projectPath, f)));
                } catch (e) {
                    // 忽略错误
                }
            }
        }

        return {
            enabled: true,
            type: 'react-i18n',
            configFiles,
            messageFiles,
            method: 't() 或 useTranslation()',
            example: `{t('common.save')} 或 const { t } = useTranslation()`,
            tips: [
                '使用 useTranslation() hook 获取 t 函数',
                '命名空间格式：t("common.save")',
                '所有文案必须通过 t() 函数包裹',
                '确保所有语言的翻译文件同步更新'
            ]
        };
    }

    /**
     * 检测 react-intl 配置
     */
    private static detectReactIntl(projectPath: string): I18nConfig {
        return {
            enabled: true,
            type: 'react-i18n',
            configFiles: [],
            messageFiles: [],
            method: 'formatMessage() 或 FormattedMessage',
            example: `<FormattedMessage id="common.save" /> 或 intl.formatMessage({ id: 'common.save' })`,
            tips: [
                '使用 FormattedMessage 组件或 formatMessage 方法',
                '消息 ID 格式：common.save',
                '所有文案必须定义在消息文件中',
                '确保多语言文件的消息 ID 保持一致'
            ]
        };
    }

    /**
     * 检测自定义国际化方案
     */
    private static detectCustomI18n(projectPath: string): I18nConfig {
        const messageFiles: string[] = [];

        // 查找可能的消息文件
        const possibleDirs = ['src/locales', 'src/i18n', 'src/lang'];
        for (const dir of possibleDirs) {
            const fullDir = path.join(projectPath, dir);
            if (fs.existsSync(fullDir)) {
                const files = fs.readdirSync(fullDir);
                for (const file of files) {
                    if (/messages?\.(ts|js)$/i.test(file)) {
                        messageFiles.push(path.join(dir, file));
                        
                        // 读取文件检测格式
                        const content = fs.readFileSync(path.join(fullDir, file), 'utf-8');
                        
                        // 检测是否是双语数组格式 [英文, 中文]
                        if (content.includes('[') && content.includes('],')) {
                            return {
                                enabled: true,
                                type: 'custom',
                                configFiles: [],
                                messageFiles,
                                method: '$t()',
                                example: `{{ $t('保存') }} 或 :label="$t('用户名')"`,
                                tips: [
                                    '使用直接键名格式：$t("保存")',
                                    '所有按钮、标签、提示文字必须使用 $t()',
                                    '表单验证规则的 message 也需要国际化',
                                    '新增文案时需要同时添加中英文翻译'
                                ]
                            };
                        }
                    }
                }
            }
        }

        // 未检测到国际化配置
        if (messageFiles.length > 0) {
            return {
                enabled: true,
                type: 'custom',
                configFiles: [],
                messageFiles,
                method: '$t()',
                example: '请查看项目中现有页面的使用方式',
                tips: [
                    '检测到国际化文件，但格式未知',
                    '请查看现有页面确认使用方式',
                    '确保所有新增文案都遵循项目规范'
                ]
            };
        }

        return {
            enabled: false,
            type: 'none',
            configFiles: [],
            messageFiles: [],
            method: '',
            example: '',
            tips: [
                '⚠️ 项目未配置国际化',
                '建议添加中英双语支持',
                '推荐使用 vue-i18n（Vue）或 react-i18next（React）'
            ]
        };
    }

    /**
     * 检测 Flutter 项目的国际化配置
     */
    private static detectFlutterI18n(projectPath: string, pubspecPath: string): I18nConfig {
        const content = fs.readFileSync(pubspecPath, 'utf-8');
        
        // 检测是否配置了 flutter_localizations
        if (content.includes('flutter_localizations')) {
            const messageFiles: string[] = [];
            
            // 查找 .arb 文件
            const l10nDir = path.join(projectPath, 'lib', 'l10n');
            if (fs.existsSync(l10nDir)) {
                const files = fs.readdirSync(l10nDir);
                for (const file of files) {
                    if (file.endsWith('.arb')) {
                        messageFiles.push(`lib/l10n/${file}`);
                    }
                }
            }

            // 检查是否有 l10n.yaml 配置文件
            const l10nConfigPath = path.join(projectPath, 'l10n.yaml');
            const configFiles = fs.existsSync(l10nConfigPath) ? ['l10n.yaml'] : [];

            return {
                enabled: true,
                type: 'flutter-intl',
                configFiles,
                messageFiles,
                method: 'AppLocalizations',
                example: `AppLocalizations.of(context)!.save 或 S.of(context).save`,
                tips: [
                    '使用 AppLocalizations.of(context)!.key',
                    '所有文本必须在 .arb 文件中定义',
                    '确保 app_en.arb 和 app_zh.arb 的键名完全一致',
                    '运行 flutter gen-l10n 生成代码'
                ]
            };
        }

        // 检测 easy_localization
        if (content.includes('easy_localization')) {
            return {
                enabled: true,
                type: 'flutter-intl',
                configFiles: [],
                messageFiles: [],
                method: 'tr()',
                example: `'save'.tr() 或 Text('save'.tr())`,
                tips: [
                    '使用 .tr() 扩展方法',
                    '翻译文件通常在 assets/translations/',
                    '确保所有语言文件的键名一致'
                ]
            };
        }

        // 未检测到国际化配置
        return {
            enabled: false,
            type: 'none',
            configFiles: [],
            messageFiles: [],
            method: '',
            example: '',
            tips: [
                '⚠️ Flutter 项目未配置国际化',
                '建议添加 flutter_localizations',
                '在 pubspec.yaml 中添加：',
                '  flutter_localizations:',
                '    sdk: flutter',
                '  intl: any'
            ]
        };
    }
}
