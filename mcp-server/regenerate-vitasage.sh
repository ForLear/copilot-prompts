#!/bin/bash

# VitaSage 配置重新生成脚本
# 使用 merge 模式，保护自定义内容

set -e

echo "🔄 重新生成 VitaSage 项目配置..."
echo ""

cd "$(dirname "$0")"

# 编译最新代码
echo "📦 编译 MCP 服务器..."
npm run build

echo ""
echo "✨ 生成配置文件..."
node test-vitasage-config.cjs

echo ""
echo "✅ 配置已更新！"
echo ""
echo "📋 配置文件位置: /Users/pailasi/Work/VitaSage/.github/copilot-instructions.md"
echo ""
echo "💡 提示："
echo "  - 使用 CUSTOM_START/CUSTOM_END 标记可保护自定义内容"
echo "  - 配置会自动应用 vitasage 配置方案"
echo "  - 包含 3 个 Agents: vitasage, vue3, logicflow"
echo ""
