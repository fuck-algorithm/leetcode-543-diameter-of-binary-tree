/**
 * 输入面板组件
 * 
 * 提供二叉树数据的输入功能，包括：
 * - 手动输入数组格式的树数据
 * - 预设的样例数据快速选择
 * - 随机生成树数据
 */

import { useState } from 'react';
import { parseArrayInput, validateTreeArray, generateRandomTree } from '../../utils/treeUtils';
import './InputPanel.css';

/**
 * InputPanel 组件的属性接口
 */
interface InputPanelProps {
  /** 数据变化时的回调函数 */
  onDataChange: (data: (number | null)[]) => void;
  /** 当前的树数据 */
  currentData: (number | null)[];
}

/**
 * 预设的样例数据
 * 包含多种典型的二叉树结构，方便用户快速测试
 */
const SAMPLE_DATA: { label: string; data: (number | null)[] }[] = [
  { label: '示例1', data: [1, 2, 3, 4, 5] },           // LeetCode 示例1
  { label: '示例2', data: [1, 2] },                    // LeetCode 示例2
  { label: '完全二叉树', data: [1, 2, 3, 4, 5, 6, 7] }, // 完全二叉树
  { label: '左斜树', data: [1, 2, null, 3, null, 4] },  // 只有左子节点的斜树
  { label: '右斜树', data: [1, null, 2, null, 3, null, 4] }, // 只有右子节点的斜树
];

/**
 * InputPanel 组件
 * 
 * 功能：
 * - 提供输入框让用户输入 LeetCode 格式的数组
 * - 提供"应用"按钮验证并应用输入
 * - 提供"随机生成"按钮生成随机树
 * - 提供预设样例按钮快速切换不同的树结构
 */
export function InputPanel({ onDataChange, currentData }: InputPanelProps) {
  // 输入框的值
  const [inputValue, setInputValue] = useState(JSON.stringify(currentData));
  // 错误信息，用于显示输入验证失败的提示
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setError(null);
  };

  const handleApply = () => {
    const parsed = parseArrayInput(inputValue);
    if (parsed === null) {
      setError('输入格式错误，请使用数组格式如 [1,2,3,null,5]');
      return;
    }
    if (!validateTreeArray(parsed)) {
      setError('数据无效：根节点不能为空，节点值范围-100到100');
      return;
    }
    setError(null);
    onDataChange(parsed);
  };

  const handleSampleClick = (data: (number | null)[]) => {
    setInputValue(JSON.stringify(data));
    setError(null);
    onDataChange(data);
  };

  const handleRandom = () => {
    const nodeCount = Math.floor(Math.random() * 10) + 3;
    const randomData = generateRandomTree(nodeCount);
    setInputValue(JSON.stringify(randomData));
    setError(null);
    onDataChange(randomData);
  };

  return (
    <div className="input-panel">
      <div className="input-row">
        <label className="input-label">输入数据:</label>
        <input
          type="text"
          className={`input-field ${error ? 'input-error' : ''}`}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          placeholder="[1,2,3,4,5]"
        />
        <button className="btn btn-apply" onClick={handleApply}>
          应用
        </button>
        <button className="btn btn-random" onClick={handleRandom}>
          随机生成
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="samples-row">
        <span className="samples-label">样例:</span>
        {SAMPLE_DATA.map((sample, index) => (
          <button
            key={index}
            className={`sample-btn ${JSON.stringify(currentData) === JSON.stringify(sample.data) ? 'active' : ''}`}
            onClick={() => handleSampleClick(sample.data)}
          >
            {sample.label}
          </button>
        ))}
      </div>
    </div>
  );
}
