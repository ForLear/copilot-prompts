import * as vscode from 'vscode';
import { ConfigManager } from './configManager';

export class PromptsProvider implements vscode.TreeDataProvider<PromptItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<PromptItem | undefined | null | void> = new vscode.EventEmitter<PromptItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<PromptItem | undefined | null | void> = this._onDidChangeTreeData.event;
    private searchText: string = '';

    constructor(private configManager: ConfigManager) {}

    setSearchText(text: string): void {
        this.searchText = text.toLowerCase();
        this.refresh();
    }

    clearSearch(): void {
        this.searchText = '';
        this.refresh();
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: PromptItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: PromptItem): Promise<PromptItem[]> {
        if (!element) {
            // 根节点：显示分类
            return [
                new PromptItem('agents', 'Agents', '', vscode.TreeItemCollapsibleState.Expanded, 'category'),
                new PromptItem('prompts', 'Prompts', '', vscode.TreeItemCollapsibleState.Expanded, 'category')
            ];
        }

        // 获取分类下的 Prompts
        const allPrompts = this.configManager.getAllPrompts();
        const selected = this.configManager.getSelectedPrompts();

        let filtered: any[];
        if (element.id === 'agents') {
            filtered = allPrompts.filter(p => p.type === 'agent');
        } else if (element.id === 'prompts') {
            filtered = allPrompts.filter(p => p.type === 'prompt');
        } else {
            return [];
        }

        // 应用搜索过滤
        if (this.searchText) {
            filtered = filtered.filter(p => 
                p.title.toLowerCase().includes(this.searchText) ||
                p.description.toLowerCase().includes(this.searchText) ||
                p.tags.some((tag: string) => tag.toLowerCase().includes(this.searchText))
            );
        }

        return filtered.map(p => {
            const item = new PromptItem(
                p.id,
                p.title,
                p.description,
                vscode.TreeItemCollapsibleState.None,
                'prompt'
            );
            
            // 设置复选框状态
            const isSelected = selected.includes(p.id);
            item.checkboxState = isSelected 
                ? vscode.TreeItemCheckboxState.Checked 
                : vscode.TreeItemCheckboxState.Unchecked;
            
            // 设置tooltip
            item.tooltip = `${p.description}\n\n路径: ${p.path}\n标签: ${p.tags.join(', ')}`;

            return item;
        });
    }
}

export class PromptItem extends vscode.TreeItem {
    constructor(
        public readonly id: string,
        public readonly label: string,
        public readonly description: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly contextValue: string
    ) {
        super(label, collapsibleState);
        this.description = description;
    }
}
