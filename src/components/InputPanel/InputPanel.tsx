import { useState } from 'react';
import { parseArrayInput, validateTreeArray, generateRandomTree } from '../../utils/treeUtils';
import './InputPanel.css';

interface InputPanelProps {
  onDataChange: (data: (number | null)[]) => void;
  currentData: (number | null)[];
}

const SAMPLE_DATA: { label: string; data: (number | null)[] }[] = [
  { label: '示例1', data: [1, 2, 3, 4, 5] },
  { label: '示例2', data: [1, 2] },
  { label: '完全二叉树', data: [1, 2, 3, 4, 5, 6, 7] },
  { label: '左斜树', data: [1, 2, null, 3, null, 4] },
  { label: '右斜树', data: [1, null, 2, null, 3, null, 4] },
];

export function InputPanel({ onDataChange, currentData }: InputPanelProps) {
  const [inputValue, setInputValue] = useState(JSON.stringify(currentData));
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
