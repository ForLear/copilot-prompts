import * as fs from 'fs';
import * as path from 'path';
import glob from 'fast-glob';
import { ProjectFeatures, AgentMetadata, Logger } from './types.js';

/**
 * 工作区文件夹接口（简化版）
 */
interface WorkspaceFolder {
    uri: { fsPath: string };
    name: string;
}

/**
 * 智能 Agent 匹配器
 * 根据项目特征自动推荐和应用合适的 Agents
 */
export class SmartAgentMatcher {
    constructor(private logger?: Logger) {}

    /**
     * 分析项目特征
     */
    async analyzeProject(workspaceFolder: WorkspaceFolder): Promise<ProjectFeatures> {
        this.log(`🔍 开始分析项目: ${workspaceFolder.name}`);

        const features: ProjectFeatures = {
            frameworks: [],
            languages: [],
            tools: [],
            keywords: [],
            projectType: 'unknown'
        };

        const rootPath = workspaceFolder.uri.fsPath;

        // 优先检测 Flutter 项目
        const pubspecPath = path.join(rootPath, 'pubspec.yaml');
        if (fs.existsSync(pubspecPath)) {
            const pubspecFeatures = this.analyzePubspecYaml(pubspecPath);
            this.mergeFeatures(features, pubspecFeatures);
            features.projectType = 'flutter';
            this.log(`✅ 项目分析完成: ${features.projectType}`);
            return features;
        }

        // 分析 package.json
        const packageJsonPath = path.join(rootPath, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            const packageFeatures = this.analyzePackageJson(packageJsonPath);
            this.mergeFeatures(features, packageFeatures);
        }

        // 分析文件结构
        const structureFeatures = await this.analyzeFileStructure(rootPath);
        this.mergeFeatures(features, structureFeatures);

        // 推断项目类型
        features.projectType = this.inferProjectType(features);

        this.log(`✅ 项目分析完成: ${features.projectType}`);

        return features;
    }

    /**
     * 分析 package.json
     */
    private analyzePackageJson(packageJsonPath: string): Partial<ProjectFeatures> {
        const features: Partial<ProjectFeatures> = {
            frameworks: [],
            languages: [],
            tools: [],
            keywords: []
        };

        try {
            const content = fs.readFileSync(packageJsonPath, 'utf-8');
            const packageJson = JSON.parse(content);

            const allDeps = {
                ...packageJson.dependencies,
                ...packageJson.devDependencies
            };

            // 检测前端框架
            if (allDeps['vue']) features.frameworks!.push('Vue 3');
            if (allDeps['react']) features.frameworks!.push('React');
            if (allDeps['@angular/core']) features.frameworks!.push('Angular');
            if (allDeps['next']) features.frameworks!.push('Next.js');
            if (allDeps['nuxt']) features.frameworks!.push('Nuxt.js');
            if (allDeps['svelte']) features.frameworks!.push('Svelte');
            if (allDeps['solid-js']) features.frameworks!.push('Solid.js');
            if (allDeps['preact']) features.frameworks!.push('Preact');
            if (allDeps['remix']) features.frameworks!.push('Remix');
            if (allDeps['astro']) features.frameworks!.push('Astro');
            
            // 检测后端框架
            if (allDeps['express']) features.frameworks!.push('Express');
            if (allDeps['koa']) features.frameworks!.push('Koa');
            if (allDeps['fastify']) features.frameworks!.push('Fastify');
            if (allDeps['nestjs'] || allDeps['@nestjs/core']) features.frameworks!.push('NestJS');
            if (allDeps['egg']) features.frameworks!.push('Egg.js');
            if (allDeps['midway']) features.frameworks!.push('Midway');
            if (allDeps['hapi']) features.frameworks!.push('Hapi');
            
            // 检测全栈框架
            if (allDeps['meteor']) features.frameworks!.push('Meteor');
            if (allDeps['blitz']) features.frameworks!.push('Blitz.js');

            // 检测构建工具
            if (allDeps['vite']) features.tools!.push('Vite');
            if (allDeps['webpack']) features.tools!.push('Webpack');
            if (allDeps['rollup']) features.tools!.push('Rollup');
            if (allDeps['parcel']) features.tools!.push('Parcel');
            if (allDeps['esbuild']) features.tools!.push('ESBuild');
            if (allDeps['turbopack']) features.tools!.push('Turbopack');
            
            // 检测 UI 组件库
            if (allDeps['element-plus']) features.tools!.push('Element Plus');
            if (allDeps['ant-design-vue']) features.tools!.push('Ant Design Vue');
            if (allDeps['antd']) features.tools!.push('Ant Design');
            if (allDeps['@mui/material']) features.tools!.push('Material-UI');
            if (allDeps['naive-ui']) features.tools!.push('Naive UI');
            if (allDeps['vuetify']) features.tools!.push('Vuetify');
            if (allDeps['quasar']) features.tools!.push('Quasar');
            if (allDeps['primevue']) features.tools!.push('PrimeVue');
            if (allDeps['chakra-ui']) features.tools!.push('Chakra UI');
            if (allDeps['@headlessui/react'] || allDeps['@headlessui/vue']) features.tools!.push('Headless UI');
            if (allDeps['daisyui']) features.tools!.push('DaisyUI');
            if (allDeps['shadcn-ui'] || allDeps['@shadcn/ui']) features.tools!.push('Shadcn UI');
            
            // 检测样式工具
            if (allDeps['tailwindcss']) features.tools!.push('Tailwind CSS');
            if (allDeps['sass'] || allDeps['node-sass']) features.tools!.push('Sass');
            if (allDeps['less']) features.tools!.push('Less');
            if (allDeps['postcss']) features.tools!.push('PostCSS');
            if (allDeps['styled-components']) features.tools!.push('Styled Components');
            if (allDeps['emotion']) features.tools!.push('Emotion');
            if (allDeps['unocss']) features.tools!.push('UnoCSS');
            
            // 检测流程图/可视化库
            if (allDeps['@logicflow/core']) features.tools!.push('LogicFlow');
            if (allDeps['echarts']) features.tools!.push('ECharts');
            if (allDeps['d3']) features.tools!.push('D3.js');
            if (allDeps['chart.js']) features.tools!.push('Chart.js');
            if (allDeps['antv'] || allDeps['@antv/g6']) features.tools!.push('AntV');
            
            // 检测编程语言
            if (allDeps['typescript']) features.languages!.push('TypeScript');
            if (packageJson.dependencies?.['react'] || packageJson.devDependencies?.['react']) {
                features.languages!.push('JavaScript');
            }

            // 检测国际化
            if (allDeps['vue-i18n'] || allDeps['react-i18n'] || allDeps['i18next'] || allDeps['react-intl']) {
                features.keywords!.push('i18n');
            }
            
            // 检测状态管理
            if (allDeps['pinia'] || allDeps['vuex'] || allDeps['redux'] || allDeps['@reduxjs/toolkit'] ||
                allDeps['mobx'] || allDeps['zustand'] || allDeps['recoil'] || allDeps['jotai']) {
                features.keywords!.push('state-management');
            }
            
            // 检测路由
            if (allDeps['vue-router'] || allDeps['react-router'] || allDeps['react-router-dom'] ||
                allDeps['@tanstack/react-router']) {
                features.keywords!.push('routing');
            }
            
            // 检测数据请求
            if (allDeps['axios'] || allDeps['@tanstack/react-query'] || allDeps['@tanstack/vue-query'] ||
                allDeps['swr'] || allDeps['urql']) {
                features.keywords!.push('data-fetching');
            }
            
            // 检测表单处理
            if (allDeps['formik'] || allDeps['react-hook-form'] || allDeps['vee-validate'] ||
                allDeps['@vuelidate/core']) {
                features.keywords!.push('forms');
            }
            
            // 检测测试工具
            if (allDeps['vitest'] || allDeps['jest'] || allDeps['@testing-library/react'] ||
                allDeps['@testing-library/vue'] || allDeps['cypress'] || allDeps['playwright']) {
                features.keywords!.push('testing');
            }
            
            // 检测移动端
            if (allDeps['vant'] || allDeps['@tarojs/taro'] || allDeps['react-native'] ||
                allDeps['uni-app'] || allDeps['@nutui/nutui']) {
                features.keywords!.push('mobile');
            }
            
            // 检测微信小程序
            if (packageJson.miniprogram || allDeps['@tarojs/taro'] || allDeps['uni-app']) {
                features.keywords!.push('miniprogram');
                features.keywords!.push('wechat');
            }
            
            // 检测数据库/ORM
            if (allDeps['prisma'] || allDeps['typeorm'] || allDeps['sequelize'] || allDeps['mongoose']) {
                features.keywords!.push('database');
            }
            
            // 检测GraphQL
            if (allDeps['graphql'] || allDeps['apollo-client'] || allDeps['@apollo/client']) {
                features.keywords!.push('graphql');
            }

        } catch (error) {
            this.log(`解析 package.json 失败: ${error}`);
        }

        return features;
    }

    /**
     * 分析 pubspec.yaml (Flutter 项目)
     */
    private analyzePubspecYaml(pubspecPath: string): Partial<ProjectFeatures> {
        const features: Partial<ProjectFeatures> = {
            frameworks: ['Flutter'],
            languages: ['Dart'],
            tools: [],
            keywords: []
        };

        try {
            const content = fs.readFileSync(pubspecPath, 'utf-8');
            
            // 检测状态管理
            if (content.includes('provider:')) features.keywords!.push('state-management');
            if (content.includes('riverpod:')) features.keywords!.push('state-management');
            if (content.includes('bloc:') || content.includes('flutter_bloc:')) features.keywords!.push('state-management');
            if (content.includes('get:') || content.includes('get_x:')) {
                features.keywords!.push('routing', 'state-management');
            }
            
            // 检测国际化
            if (content.includes('flutter_localizations:') || content.includes('intl:') || content.includes('easy_localization:')) {
                features.keywords!.push('i18n');
            }
            
            // 检测路由
            if (content.includes('go_router:') || content.includes('auto_route:')) features.keywords!.push('routing');
            
            // 检测网络请求
            if (content.includes('dio:') || content.includes('http:')) features.keywords!.push('data-fetching');
            
            // 检测UI库
            if (content.includes('flutter_screenutil:')) features.tools!.push('ScreenUtil');
            
            // 检测测试
            if (content.includes('flutter_test:') || content.includes('mockito:') || content.includes('integration_test:')) {
                features.keywords!.push('testing');
            }
            
        } catch (error) {
            this.log(`解析 pubspec.yaml 失败: ${error}`);
        }

        return features;
    }

    /**
     * 分析文件结构
     */
    private async analyzeFileStructure(rootPath: string): Promise<Partial<ProjectFeatures>> {
        const features: Partial<ProjectFeatures> = {
            frameworks: [],
            languages: [],
            tools: [],
            keywords: []
        };

        try {
            const patterns = [
                '**/*.vue', '**/*.ts', '**/*.tsx', '**/*.jsx', '**/*.js',
                '**/*.py', '**/*.java', '**/*.go', '**/*.rs', '**/*.cpp', '**/*.c',
                '**/locales/**', '**/i18n/**', '**/lang/**',
                '**/stores/**', '**/store/**', '**/redux/**',
                '**/*.test.*', '**/*.spec.*',
                '**/components/**', '**/pages/**', '**/views/**'
            ];
            
            const files = await glob(patterns, {
                cwd: rootPath,
                ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**'],
                onlyFiles: true
            });

            // 检测前端框架
            if (files.some(f => f.endsWith('.vue'))) features.frameworks!.push('Vue');
            if (files.some(f => f.endsWith('.tsx'))) features.frameworks!.push('React');
            if (files.some(f => f.endsWith('.svelte'))) features.frameworks!.push('Svelte');
            
            // 检测编程语言
            if (files.some(f => f.endsWith('.ts') || f.endsWith('.tsx'))) features.languages!.push('TypeScript');
            if (files.some(f => f.endsWith('.js') || f.endsWith('.jsx'))) features.languages!.push('JavaScript');
            if (files.some(f => f.endsWith('.py'))) features.languages!.push('Python');
            if (files.some(f => f.endsWith('.java'))) features.languages!.push('Java');
            if (files.some(f => f.endsWith('.go'))) features.languages!.push('Go');
            if (files.some(f => f.endsWith('.rs'))) features.languages!.push('Rust');
            if (files.some(f => f.match(/\.(cpp|cc|cxx|c)$/))) features.languages!.push('C/C++');
            
            // 检测国际化
            if (files.some(f => f.includes('/locales/') || f.includes('/i18n/') || f.includes('/lang/'))) {
                features.keywords!.push('i18n');
            }
            
            // 检测状态管理
            if (files.some(f => f.includes('/stores/') || f.includes('/store/') || f.includes('/redux/'))) {
                features.keywords!.push('state-management');
            }
            
            // 检测测试文件
            if (files.some(f => f.includes('.test.') || f.includes('.spec.'))) {
                features.keywords!.push('testing');
            }

        } catch (error) {
            this.log(`扫描文件结构失败: ${error}`);
        }

        return features;
    }

    /**
     * 匹配 Agents
     */
    matchAgents(features: ProjectFeatures, availableAgents: AgentMetadata[]): AgentMetadata[] {
        const scoredAgents = availableAgents.map(agent => {
            const score = this.calculateMatchScore(features, agent);
            return { ...agent, score };
        });

        return scoredAgents
            .filter(a => a.score > 0)
            .sort((a, b) => (b.score || 0) - (a.score || 0));
    }

    /**
     * 计算匹配分数
     */
    private calculateMatchScore(features: ProjectFeatures, agent: AgentMetadata): number {
        let score = 0;

        const WEIGHTS = {
            framework: 10,
            tool: 8,
            language: 5,
            keyword: 3,
            tag: 2
        };

        // 框架匹配
        features.frameworks.forEach(f => {
            if (agent.applicableWhen?.frameworks?.some(af => af.toLowerCase().includes(f.toLowerCase()))) {
                score += WEIGHTS.framework;
            }
        });

        // 工具匹配
        features.tools.forEach(t => {
            if (agent.applicableWhen?.tools?.some(at => at.toLowerCase().includes(t.toLowerCase()))) {
                score += WEIGHTS.tool;
            }
        });

        // 语言匹配
        features.languages.forEach(l => {
            if (agent.applicableWhen?.languages?.some(al => al.toLowerCase().includes(l.toLowerCase()))) {
                score += WEIGHTS.language;
            }
        });

        // 关键词匹配
        features.keywords.forEach(k => {
            if (agent.applicableWhen?.keywords?.some(ak => ak.toLowerCase().includes(k.toLowerCase()))) {
                score += WEIGHTS.keyword;
            }
        });

        // 标签匹配
        features.frameworks.concat(features.tools, features.languages, features.keywords).forEach(feature => {
            if (agent.tags.some(tag => tag.toLowerCase().includes(feature.toLowerCase()))) {
                score += WEIGHTS.tag;
            }
        });

        return score;
    }

    /**
     * 解析 Agent 元数据
     */
    parseAgentMetadata(filePath: string, content: string): AgentMetadata {
        const id = path.basename(filePath, '.agent.md');
        
        // 解析 YAML frontmatter
        let description = '';
        let tags: string[] = [];

        if (content.startsWith('---')) {
            const endIndex = content.indexOf('---', 3);
            if (endIndex > 0) {
                const frontmatter = content.substring(3, endIndex);
                const descMatch = frontmatter.match(/description:\s*['"](.+)['"]/);
                if (descMatch) description = descMatch[1];
                
                const tagsMatch = frontmatter.match(/tags:\s*\[(.+)\]/);
                if (tagsMatch) {
                    tags = tagsMatch[1].split(',').map(t => t.trim().replace(/['"]/g, ''));
                }
            }
        }

        // 提取标题
        const titleMatch = content.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1] : id;

        return {
            id,
            path: filePath,
            title,
            description,
            tags,
            applicableWhen: {
                frameworks: tags.filter(t => 
                    ['vue', 'vue3', 'react', 'angular', 'next', 'nuxt', 'svelte', 'flutter', 
                     'express', 'nestjs', 'koa', 'fastify'].includes(t.toLowerCase())
                ),
                languages: tags.filter(t => 
                    ['typescript', 'javascript', 'python', 'java', 'go', 'rust', 'dart', 'c++'].includes(t.toLowerCase())
                ),
                tools: tags.filter(t => 
                    ['vite', 'webpack', 'rollup', 'logicflow', 'element-plus', 'antd', 
                     'tailwind', 'sass', 'echarts', 'prisma', 'graphql'].includes(t.toLowerCase())
                ),
                keywords: tags.filter(t => 
                    ['i18n', 'state-management', 'routing', 'testing', 'mobile', 'miniprogram', 
                     'database', 'forms', 'data-fetching'].includes(t.toLowerCase())
                )
            }
        };
    }

    private mergeFeatures(target: ProjectFeatures, source: Partial<ProjectFeatures>): void {
        if (source.frameworks) target.frameworks.push(...source.frameworks);
        if (source.languages) target.languages.push(...source.languages);
        if (source.tools) target.tools.push(...source.tools);
        if (source.keywords) target.keywords.push(...source.keywords);
    }

    private inferProjectType(features: ProjectFeatures): string {
        // 前端框架
        if (features.frameworks.some(f => f.toLowerCase().includes('vue'))) return 'vue3';
        if (features.frameworks.some(f => f.toLowerCase().includes('react'))) return 'react';
        if (features.frameworks.some(f => f.toLowerCase().includes('angular'))) return 'angular';
        if (features.frameworks.some(f => f.toLowerCase().includes('svelte'))) return 'svelte';
        if (features.frameworks.some(f => f.toLowerCase().includes('next'))) return 'nextjs';
        if (features.frameworks.some(f => f.toLowerCase().includes('nuxt'))) return 'nuxtjs';
        
        // 移动端/跨平台
        if (features.frameworks.some(f => f.toLowerCase().includes('flutter'))) return 'flutter';
        if (features.frameworks.some(f => f.toLowerCase().includes('react-native'))) return 'react-native';
        if (features.keywords.includes('miniprogram')) return 'miniprogram';
        
        // 后端框架
        if (features.frameworks.some(f => f.toLowerCase().includes('nest'))) return 'nestjs';
        if (features.frameworks.some(f => f.toLowerCase().includes('express'))) return 'express';
        if (features.frameworks.some(f => f.toLowerCase().includes('koa'))) return 'koa';
        if (features.frameworks.some(f => f.toLowerCase().includes('fastify'))) return 'fastify';
        
        // 编程语言
        if (features.languages.includes('TypeScript')) return 'typescript';
        if (features.languages.includes('Python')) return 'python';
        if (features.languages.includes('Java')) return 'java';
        if (features.languages.includes('Go')) return 'go';
        if (features.languages.includes('Rust')) return 'rust';
        
        return 'general';
    }

    private log(message: string): void {
        this.logger?.log(message);
    }
}
