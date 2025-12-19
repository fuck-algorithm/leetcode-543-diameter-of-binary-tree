/**
 * 代码面板组件
 * 
 * 显示算法的 Java 代码，并根据当前执行步骤：
 * - 高亮当前执行的代码行
 * - 在相关行旁边显示变量的当前值
 */

import { useMemo } from 'react';
import { AlgorithmStep, VariableState } from '../../types';
import { parseCodeLines } from '../../algorithm/diameterAlgorithm';
import './CodePanel.css';

/**
 * CodePanel 组件的属性接口
 */
interface CodePanelProps {
  /** 当前算法执行步骤，包含高亮行号和变量状态 */
  currentStep: AlgorithmStep | null;
}

/**
 * CodePanel 组件
 * 
 * 功能：
 * - 显示带行号的 Java 代码
 * - 根据当前步骤高亮对应的代码行
 * - 在代码行旁边显示当前变量的值
 * - 提供语法高亮（关键字、类名、方法名、数字等）
 */
export function CodePanel({ currentStep }: CodePanelProps) {
  // 解析代码为行数组，只需要执行一次
  const codeLines = useMemo(() => parseCodeLines(), []);
  // 当前高亮的行号
  const currentLine = currentStep?.codeLineNumber || 0;

  /**
   * 创建变量映射：行号 -> 变量列表
   * 用于在对应的代码行旁边显示变量值
   */
  const variablesByLine = useMemo(() => {
    const variables = currentStep?.variables || [];
    const map = new Map<number, VariableState[]>();
    for (const v of variables) {
      const existing = map.get(v.line) || [];
      existing.push(v);
      map.set(v.line, existing);
    }
    return map;
  }, [currentStep?.variables]);

  return (
    <div className="code-panel">
      <div className="code-header">
        <span className="code-title">Java 代码</span>
        <span className="code-lang">Solution.java</span>
      </div>
      <div className="code-content">
        {codeLines.map((line) => {
          const isHighlighted = line.lineNumber === currentLine;
          const lineVariables = variablesByLine.get(line.lineNumber) || [];

          return (
            <div
              key={line.lineNumber}
              className={`code-line ${isHighlighted ? 'highlighted' : ''}`}
            >
              <span className="line-number">{line.lineNumber}</span>
              <span className="line-content">
                <code dangerouslySetInnerHTML={{ __html: highlightSyntax(line.content) }} />
              </span>
              {lineVariables.length > 0 && (
                <span className="line-variables">
                  {lineVariables.map((v, i) => (
                    <span key={i} className="variable-badge">
                      {v.name} = <span className="variable-value">{v.value}</span>
                    </span>
                  ))}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 简单的 Java 语法高亮函数
 * 
 * 将代码中的关键字、类名、方法名、数字和注释用不同的 CSS 类包裹，
 * 以便在 CSS 中设置不同的颜色。
 * 
 * @param code - 原始代码字符串
 * @returns 带有 HTML 标签的高亮代码
 */
function highlightSyntax(code: string): string {
  // Java 关键字列表
  const keywords = ['class', 'private', 'public', 'int', 'if', 'return', 'null', 'new'];
  
  // 首先转义 HTML 特殊字符，防止 XSS
  let result = escapeHtml(code);

  // 高亮关键字（紫色）
  for (const kw of keywords) {
    const regex = new RegExp(`\\b${kw}\\b`, 'g');
    result = result.replace(regex, `<span class="keyword">${kw}</span>`);
  }

  // 高亮类名（青色）
  result = result.replace(/\b(TreeNode|Solution|Math)\b/g, '<span class="class-name">$1</span>');

  // 高亮方法名（黄色）
  result = result.replace(/\b(diameterOfBinaryTree|depth|max)\b/g, '<span class="method-name">$1</span>');

  // 高亮数字（橙色）
  result = result.replace(/\b(\d+)\b/g, '<span class="number">$1</span>');

  // 高亮注释（灰色）
  result = result.replace(/(\/\/.*)$/gm, '<span class="comment">$1</span>');

  return result;
}

/**
 * HTML 特殊字符转义函数
 * 
 * 将 HTML 特殊字符转换为实体，防止 XSS 攻击
 * 
 * @param text - 原始文本
 * @returns 转义后的安全文本
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')   // & 必须最先替换
    .replace(/</g, '&lt;')    // 小于号
    .replace(/>/g, '&gt;');   // 大于号
}
