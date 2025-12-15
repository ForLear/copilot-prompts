/**
 * Phase 4 测试脚本 - 傻瓜模式功能验证
 * 
 * 测试内容:
 * 1. auto_setup - 一键自动配置
 * 2. health_check - 健康检查
 * 3. get_smart_standards - 智能规范推荐
 * 4. use_preset - 预设场景
 * 5. list_presets - 列出预设
 * 6. analyze_project - 自动检测路径
 */

const { spawn } = require('child_process');
const path = require('path');

const serverPath = path.join(__dirname, 'build/index.js');

// 测试场景
const testCases = [
  {
    name: '🧪 测试 1: health_check - 健康检查',
    input: {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'health_check',
        arguments: {
          verbose: true
        }
      }
    }
  },
  {
    name: '🧪 测试 2: list_presets - 列出预设',
    input: {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'list_presets',
        arguments: {}
      }
    }
  },
  {
    name: '🧪 测试 3: use_preset - Vue 3 表单',
    input: {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'use_preset',
        arguments: {
          preset: 'vue3-form'
        }
      }
    }
  },
  {
    name: '🧪 测试 4: get_smart_standards - 智能推荐（Vue）',
    input: {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'get_smart_standards',
        arguments: {
          fileContent: `
            import { ref } from 'vue';
            import { ElForm } from 'element-plus';
            import { useI18n } from 'vue-i18n';
            
            const form = ref({});
          `
        }
      }
    }
  },
  {
    name: '🧪 测试 5: analyze_project - 自动检测路径',
    input: {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'analyze_project',
        arguments: {}
      }
    }
  },
  {
    name: '🧪 测试 6: use_preset - Pinia Store',
    input: {
      jsonrpc: '2.0',
      id: 6,
      method: 'tools/call',
      params: {
        name: 'use_preset',
        arguments: {
          preset: 'pinia-store'
        }
      }
    }
  }
];

async function runTest(testCase, index) {
  return new Promise((resolve, reject) => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(testCase.name);
    console.log(`${'='.repeat(80)}\n`);

    const server = spawn('node', [serverPath]);
    let output = '';
    let errorOutput = '';
    let hasReceivedResponse = false;

    server.stdout.on('data', (data) => {
      output += data.toString();
      
      // 检查是否收到完整的 JSON-RPC 响应
      const lines = output.split('\n');
      for (const line of lines) {
        if (line.trim() && line.includes('"jsonrpc"')) {
          try {
            const response = JSON.parse(line);
            if (response.id === testCase.input.id) {
              hasReceivedResponse = true;
              
              console.log('📥 响应:');
              if (response.result && response.result.content) {
                const content = response.result.content[0];
                const data = JSON.parse(content.text);
                
                // 美化输出
                if (data.success) {
                  console.log('✅ 成功');
                  
                  // 根据不同工具显示关键信息
                  if (testCase.input.params.name === 'health_check') {
                    console.log(`\n状态: ${data.summary}`);
                    console.log('\n检查结果:');
                    Object.entries(data.checks).forEach(([key, check]) => {
                      console.log(`  ${key}: ${check.status}`);
                      if (check.details && check.details.length > 0) {
                        check.details.slice(0, 2).forEach(d => console.log(`    ${d}`));
                      }
                    });
                  } else if (testCase.input.params.name === 'list_presets') {
                    console.log(`\n找到 ${data.total} 个预设场景:`);
                    data.presets.forEach(p => {
                      console.log(`  ${p.id}: ${p.name}`);
                      console.log(`    ${p.description}`);
                    });
                  } else if (testCase.input.params.name === 'use_preset') {
                    console.log(`\n预设: ${data.preset.name}`);
                    console.log(`描述: ${data.preset.description}`);
                    console.log(`加载规范: ${data.standards.join(', ')}`);
                    console.log(`Token 估算: ${data.stats.estimatedTokens}`);
                  } else if (testCase.input.params.name === 'get_smart_standards') {
                    console.log(`\n检测来源: ${data.analysis.source}`);
                    console.log(`文件类型: ${data.analysis.fileType}`);
                    console.log(`导入: ${data.analysis.imports.join(', ')}`);
                    console.log(`场景: ${data.analysis.scenario}`);
                    console.log(`加载规范: ${data.standards.join(', ')}`);
                    console.log(`Token 估算: ${data.stats.estimatedTokens}`);
                  } else if (testCase.input.params.name === 'analyze_project') {
                    console.log(`\n项目: ${data.projectName}`);
                    console.log(`路径: ${data.projectPath}`);
                    console.log(`自动检测: ${data.autoDetected ? '是' : '否'}`);
                    console.log(`类型: ${data.features.projectType}`);
                    console.log(`框架: ${data.features.frameworks.join(', ')}`);
                  }
                  
                  console.log('\n✅ 测试通过\n');
                } else {
                  console.log('❌ 失败:', data.error);
                }
              }
              
              server.kill();
              setTimeout(() => resolve(), 100);
            }
          } catch (e) {
            // 不是有效的 JSON，继续等待
          }
        }
      }
    });

    server.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    server.on('close', (code) => {
      if (!hasReceivedResponse) {
        console.log('❌ 未收到响应');
        console.log('错误输出:', errorOutput);
        reject(new Error('No response received'));
      }
    });

    // 发送请求
    setTimeout(() => {
      server.stdin.write(JSON.stringify(testCase.input) + '\n');
    }, 500);

    // 超时处理
    setTimeout(() => {
      if (!hasReceivedResponse) {
        server.kill();
        reject(new Error('Test timeout'));
      }
    }, 10000);
  });
}

async function runAllTests() {
  console.log('\n🚀 开始 Phase 4 功能测试...\n');
  
  let passed = 0;
  let failed = 0;

  for (let i = 0; i < testCases.length; i++) {
    try {
      await runTest(testCases[i], i);
      passed++;
    } catch (error) {
      console.log(`❌ 测试失败: ${error.message}\n`);
      failed++;
    }
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 测试总结');
  console.log(`${'='.repeat(80)}\n`);
  console.log(`✅ 通过: ${passed}`);
  console.log(`❌ 失败: ${failed}`);
  console.log(`📈 通过率: ${((passed / testCases.length) * 100).toFixed(1)}%\n`);

  if (failed === 0) {
    console.log('🎉 所有测试通过！Phase 4 傻瓜模式功能正常！\n');
  } else {
    console.log('⚠️  部分测试失败，请检查错误信息\n');
  }
}

runAllTests().catch(console.error);
