#!/usr/bin/env node

/**
 * 通用配置生成工具
 * 可为任何项目生成 Copilot 配置
 * 
 * 使用方法:
 *   node generate-project-config.cjs <项目路径> [配置ID] [agents...]
 * 
 * 示例:
 *   # VitaSage 项目
 *   node generate-project-config.cjs /Users/pailasi/Work/VitaSage vitasage vitasage,vue3,logicflow
 * 
 *   # Flutter 项目
 *   node generate-project-config.cjs /Users/pailasi/Work/my_flutter flutter-recipe flutter
 * 
 *   # 微信小程序
 *   node generate-project-config.cjs /Users/pailasi/Work/MTA-Market wechat wechat-miniprogram
 * 
 *   # 自动匹配
 *   node generate-project-config.cjs /Users/pailasi/Work/weipin
 */

const { generateConfig } = require('./build/tools/generateConfig.js');

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
📋 通用配置生成工具

使用方法:
  node generate-project-config.cjs <项目路径> [配置ID] [agents]

参数说明:
  项目路径     必填，项目的绝对路径
  配置ID       可选，配置方案ID（如 vitasage, flutter-recipe）
  agents       可选，手动指定agents，用逗号分隔（如 vue3,pinia）

示例:

  # VitaSage 项目（使用 vitasage 配置方案）
  node generate-project-config.cjs /Users/pailasi/Work/VitaSage vitasage vitasage,vue3,logicflow

  # Flutter 项目（使用 flutter-recipe 配置方案）
  node generate-project-config.cjs /Users/pailasi/Work/my_flutter flutter-recipe flutter

  # 微信小程序（自动匹配 agents）
  node generate-project-config.cjs /Users/pailasi/Work/MTA-Market wechat

  # 标准 Vue 项目（自动匹配）
  node generate-project-config.cjs /Users/pailasi/Work/weipin

配置方案列表:
  - vitasage         VitaSage 工业配方系统（Element Plus）
  - flutter-recipe   Flutter 配方管理项目
  - wechat          微信小程序标准配置
  - standard        标准 Web 项目配置
`);
    process.exit(0);
  }

  const projectPath = args[0];
  const configId = args[1] || undefined;
  const agentIds = args[2] ? args[2].split(',').map(a => a.trim()) : undefined;

  console.log(`🚀 生成配置`);
  console.log(`   项目: ${projectPath}`);
  if (configId) console.log(`   配置方案: ${configId}`);
  if (agentIds) console.log(`   Agents: ${agentIds.join(', ')}`);
  console.log('');

  const result = await generateConfig({
    projectPath,
    agentIds,
    autoMatch: !agentIds, // 如果没有指定agents，则自动匹配
    updateMode: 'merge',  // 默认保护模式
    configId,
  });

  const data = JSON.parse(result.content[0].text);
  
  if (data.success) {
    console.log('\n✅ 成功！');
    console.log(`\n配置文件: ${data.configPath}`);
    console.log(`应用的 Agents: ${data.agents.map(a => a.id).join(', ')}`);
  } else {
    console.error('\n❌ 失败:', data.error);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('❌ 错误:', err.message);
  process.exit(1);
});
