#!/usr/bin/env node

/**
 * 测试配置生成 - VitaSage项目
 * 验证新的配置保护机制和configId支持
 */

const { generateConfig } = require('./build/tools/generateConfig.js');

async function test() {
  console.log('🧪 测试 VitaSage 配置生成\n');
  
  const result = await generateConfig({
    projectPath: '/Users/pailasi/Work/VitaSage',
    agentIds: ['vitasage', 'vue3', 'logicflow'], // 手动指定
    autoMatch: false,
    updateMode: 'merge',  // 保护模式
    configId: 'vitasage', // 使用vitasage配置方案
  });
  
  console.log('\n结果:');
  console.log(JSON.parse(result.content[0].text));
}

test().catch(console.error);
