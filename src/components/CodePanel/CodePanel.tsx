import { useMemo } from 'react';
import { AlgorithmStep, VariableState } from '../../types';
import { parseCodeLines } from '../../algorithm/diameterAlgorithm';
import './CodePanel.css';

interface CodePanelProps {
  currentStep: AlgorithmStep | null;
}

export function CodePanel({ currentStep }: CodePanelProps) {
  const codeLines = useMemo(() => parseCodeLines(), []);
  const currentLine = currentStep?.codeLineNumber || 0;

  // 创建变量映射：行号 -> 变量列表
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

// 简单的语法高亮
function highlightSyntax(code: string): string {
  // 关键字
  const keywords = ['class', 'private', 'public', 'int', 'if', 'return', 'null', 'new'];
  let result = escapeHtml(code);

  // 高亮关键字
  for (const kw of keywords) {
    const regex = new RegExp(`\\b${kw}\\b`, 'g');
    result = result.replace(regex, `<span class="keyword">${kw}</span>`);
  }

  // 高亮类名
  result = result.replace(/\b(TreeNode|Solution|Math)\b/g, '<span class="class-name">$1</span>');

  // 高亮方法名
  result = result.replace(/\b(diameterOfBinaryTree|depth|max)\b/g, '<span class="method-name">$1</span>');

  // 高亮数字
  result = result.replace(/\b(\d+)\b/g, '<span class="number">$1</span>');

  // 高亮注释
  result = result.replace(/(\/\/.*)$/gm, '<span class="comment">$1</span>');

  return result;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
