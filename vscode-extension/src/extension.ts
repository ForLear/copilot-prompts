import * as vscode from 'vscode';
import { PromptsProvider, PromptItem } from './promptsProvider';
import { ConfigManager } from './configManager';
import { ConfigValidator } from './configValidator';

export function activate(context: vscode.ExtensionContext) {
    console.log('Copilot Prompts Manager 已激活');

    const configManager = new ConfigManager(context);
    const promptsProvider = new PromptsProvider(configManager);
    const configValidator = new ConfigValidator();

    // 注册 TreeView
    const treeView = vscode.window.createTreeView('copilotPromptsTree', {
        treeDataProvider: promptsProvider,
        showCollapseAll: true,
        canSelectMany: false
    });

    // 监听 checkbox 变化事件，立即生效
    treeView.onDidChangeCheckboxState(async (event) => {
        for (const [item, state] of event.items) {
            const promptItem = item as PromptItem;
            if (promptItem.id && promptItem.contextValue === 'prompt') {
                const isChecked = state === vscode.TreeItemCheckboxState.Checked;
                const currentlySelected = configManager.getSelectedPrompts().includes(promptItem.id);
                
                // 只在状态变化时处理
                if (isChecked !== currentlySelected) {
                    configManager.togglePrompt(promptItem.id);
                }
            }
        }
        
        // 立即应用配置到当前项目
        await configManager.applyConfig();
        promptsProvider.refresh();
        updateStatusBar();
        
        const count = configManager.getSelectedPrompts().length;
        vscode.window.showInformationMessage(`✅ 配置已自动应用到当前项目 (${count} 个)`);
    });

    // 创建状态栏
    const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
    );
    statusBarItem.command = 'copilotPrompts.viewCurrent';
    context.subscriptions.push(statusBarItem);

    // 更新状态栏
    const updateStatusBar = () => {
        const selected = configManager.getSelectedPrompts();
        const count = selected.length;
        const allPrompts = configManager.getAllPrompts();
        const activePrompts = allPrompts.filter(p => selected.includes(p.id));
        const tooltip = activePrompts.length > 0 
            ? `当前生效的配置:\n${activePrompts.map(p => `• ${p.title}`).join('\n')}`
            : '未应用任何配置';
        
        statusBarItem.text = `$(file-code) Copilot: ${count}`;
        statusBarItem.tooltip = tooltip;
        statusBarItem.tooltip = `已选择 ${count} 个配置\n点击查看详情`;
        statusBarItem.show();
    };
    updateStatusBar();

    // 应用配置到当前项目
    const applyConfig = vscode.commands.registerCommand('copilotPrompts.applyConfig', async () => {
        try {
            const result = await configManager.applyConfig();
            if (result.success) {
                vscode.window.showInformationMessage(
                    `✅ 配置已应用到当前项目！共 ${result.count} 个 Prompt`,
                    '查看'
                ).then(selection => {
                    if (selection === '查看') {
                        vscode.commands.executeCommand('copilotPrompts.viewCurrent');
                    }
                });
                updateStatusBar();
            }
        } catch (error) {
            vscode.window.showErrorMessage(`应用配置失败: ${error}`);
        }
    });

    // 检查配置问题
    const checkIssues = vscode.commands.registerCommand('copilotPrompts.checkIssues', async () => {
        const issues = await configValidator.checkAll();
        await configValidator.showResults(issues);
    });

    // 应用到全局（移除，改为只应用到当前项目）
    const applyGlobal = vscode.commands.registerCommand('copilotPrompts.applyGlobal', async () => {
        // 保留命令用于向后兼容，实际调用 applyConfig
        vscode.commands.executeCommand('copilotPrompts.applyConfig');
    });

    // 刷新
    const refresh = vscode.commands.registerCommand('copilotPrompts.refresh', () => {
        promptsProvider.refresh();
        updateStatusBar();
        vscode.window.showInformationMessage('✅ 已刷新');
    });

    // 全选
    const selectAll = vscode.commands.registerCommand('copilotPrompts.selectAll', async () => {
        configManager.selectAll();
        await configManager.applyConfig();
        promptsProvider.refresh();
        updateStatusBar();
        const count = configManager.getSelectedPrompts().length;
        vscode.window.showInformationMessage(`✅ 已全选并应用到当前项目 (${count} 个)`);
    });

    // 清空
    const clearAll = vscode.commands.registerCommand('copilotPrompts.clearAll', async () => {
        configManager.clearAll();
        await configManager.applyConfig();
        promptsProvider.refresh();
        updateStatusBar();
        vscode.window.showInformationMessage('✅ 已清空并应用配置');
    });

    // 切换单项（已弃用，由 checkbox 事件替代）
    const toggleItem = vscode.commands.registerCommand('copilotPrompts.toggleItem', (item: PromptItem) => {
        // 此命令已由 onDidChangeCheckboxState 事件替代
        // 保留用于向后兼容
    });

    // 搜索
    const search = vscode.commands.registerCommand('copilotPrompts.search', async () => {
        const searchText = await vscode.window.showInputBox({
            prompt: '搜索 Prompts 和 Agents',
            placeHolder: '输入关键词搜索标题、描述或标签...',
            value: ''
        });
        
        if (searchText !== undefined) {
            if (searchText.trim()) {
                promptsProvider.setSearchText(searchText);
                vscode.window.showInformationMessage(`🔍 搜索: "${searchText}"`);
            } else {
                promptsProvider.clearSearch();
                vscode.window.showInformationMessage('✅ 已清除搜索');
            }
        }
    });

    // 显示当前生效的配置
    const showActive = vscode.commands.registerCommand('copilotPrompts.showActive', () => {
        const selected = configManager.getSelectedPrompts();
        const allPrompts = configManager.getAllPrompts();
        const activePrompts = allPrompts.filter(p => selected.includes(p.id));
        
        if (activePrompts.length === 0) {
            vscode.window.showInformationMessage('ℹ️ 当前没有生效的配置');
            return;
        }

        const items = activePrompts.map(p => ({
            label: `$(${p.type === 'agent' ? 'person' : 'file'}) ${p.title}`,
            description: p.description,
            detail: `标签: ${p.tags.join(', ')}`
        }));

        vscode.window.showQuickPick(items, {
            title: `当前生效的配置 (${activePrompts.length} 个)`,
            placeHolder: '这些配置正在影响 Copilot 的代码生成...',
            matchOnDescription: true,
            matchOnDetail: true
        });
    });

    // 查看当前配置
    const viewCurrent = vscode.commands.registerCommand('copilotPrompts.viewCurrent', async () => {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showWarningMessage('请先打开一个工作区');
            return;
        }

        const configPath = vscode.Uri.joinPath(workspaceFolder.uri, '.github', 'copilot-instructions.md');
        try {
            const doc = await vscode.workspace.openTextDocument(configPath);
            await vscode.window.showTextDocument(doc);
        } catch (error) {
            vscode.window.showWarningMessage('配置文件不存在，请先应用配置');
        }
    });

    // 打开管理器
    const openManager = vscode.commands.registerCommand('copilotPrompts.openManager', () => {
        const panel = vscode.window.createWebviewPanel(
            'copilotPromptsManager',
            'Copilot Prompts 管理器',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        panel.webview.html = getWebviewContent(configManager);

        // 处理来自 Webview 的消息
        panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'apply':
                        configManager.setSelectedPrompts(message.selected);
                        vscode.commands.executeCommand('copilotPrompts.applyConfig');
                        promptsProvider.refresh();
                        updateStatusBar();
                        break;
                    case 'getState':
                        panel.webview.postMessage({
                            command: 'state',
                            selected: configManager.getSelectedPrompts()
                        });
                        break;
                }
            },
            undefined,
            context.subscriptions
        );
    });

    // 加载模板
    const loadTemplate = vscode.commands.registerCommand('copilotPrompts.loadTemplate', async () => {
        const templates = {
            'vue3-frontend': {
                name: 'Vue 3 前端项目',
                prompts: ['vue3-agent', 'typescript-agent', 'i18n-agent']
            },
            'vitasage': {
                name: 'VitaSage 工业项目',
                prompts: ['vitasage-agent', 'typescript-agent', 'i18n-agent']
            },
            'fullstack': {
                name: '全栈项目',
                prompts: ['vitasage-agent', 'vue3-agent', 'typescript-agent', 'i18n-agent']
            }
        };

        const items = Object.entries(templates).map(([key, value]) => ({
            label: value.name,
            description: `包含 ${value.prompts.length} 个配置`,
            detail: value.prompts.join(', '),
            key: key
        }));

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: '选择配置模板'
        });

        if (selected) {
            const template = templates[selected.key as keyof typeof templates];
            configManager.setSelectedPrompts(template.prompts);
            promptsProvider.refresh();
            updateStatusBar();
            vscode.window.showInformationMessage(`✅ 已加载 ${template.name} 模板`);
        }
    });

    context.subscriptions.push(
        treeView,
        applyConfig,
        checkIssues,
        applyGlobal,
        refresh,
        selectAll,
        clearAll,
        toggleItem,
        search,
        showActive,
        viewCurrent,
        openManager,
        loadTemplate
    );
}

function getWebviewContent(configManager: ConfigManager): string {
    const selected = configManager.getSelectedPrompts();
    const all = configManager.getAllPrompts();

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { padding: 20px; font-family: var(--vscode-font-family); }
        .prompt-item { padding: 10px; margin: 10px 0; border: 1px solid var(--vscode-panel-border); border-radius: 4px; }
        .prompt-item:hover { background: var(--vscode-list-hoverBackground); }
        label { display: flex; align-items: center; cursor: pointer; }
        input[type="checkbox"] { margin-right: 10px; }
        .actions { margin-top: 20px; display: flex; gap: 10px; }
        button { padding: 8px 16px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; cursor: pointer; }
        button:hover { background: var(--vscode-button-hoverBackground); }
    </style>
</head>
<body>
    <h2>选择 Copilot Prompts</h2>
    <div id="prompts">
        ${all.map(p => `
            <div class="prompt-item">
                <label>
                    <input type="checkbox" value="${p.id}" ${selected.includes(p.id) ? 'checked' : ''}>
                    <div>
                        <strong>${p.title}</strong>
                        <div style="font-size: 12px; opacity: 0.8;">${p.description}</div>
                    </div>
                </label>
            </div>
        `).join('')}
    </div>
    <div class="actions">
        <button onclick="apply()">应用配置</button>
        <button onclick="selectAll()">全选</button>
        <button onclick="clearAll()">清空</button>
    </div>
    <script>
        const vscode = acquireVsCodeApi();
        
        function apply() {
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            const selected = Array.from(checkboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);
            vscode.postMessage({ command: 'apply', selected });
        }
        
        function selectAll() {
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
        }
        
        function clearAll() {
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        }
    </script>
</body>
</html>`;
}

export function deactivate() {}
