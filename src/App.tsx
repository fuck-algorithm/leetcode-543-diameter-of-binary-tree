/**
 * 应用主组件
 * 
 * LeetCode 543. 二叉树的直径 - 算法可视化
 * 
 * 这是一个交互式的算法可视化工具，帮助用户理解二叉树直径算法的执行过程。
 * 
 * 主要功能：
 * - 输入二叉树数据（支持手动输入、预设样例、随机生成）
 * - 可视化展示二叉树结构
 * - 逐步演示算法执行过程
 * - 同步显示代码执行位置和变量状态
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header/Header';
import { InputPanel } from './components/InputPanel/InputPanel';
import { TreeVisualization } from './components/TreeVisualization/TreeVisualization';
import { CodePanel } from './components/CodePanel/CodePanel';
import { ControlPanel } from './components/ControlPanel/ControlPanel';
import { WeChatFloat } from './components/WeChatFloat/WeChatFloat';

import { buildTreeFromArray, convertToD3Tree } from './utils/treeUtils';
import { generateAlgorithmSteps } from './algorithm/diameterAlgorithm';
import './App.css';

// ========== 配置常量 ==========
/** 默认的树数据，对应 LeetCode 示例1 */
const DEFAULT_DATA: (number | null)[] = [1, 2, 3, 4, 5];
/** 自动播放时每步之间的间隔时间（毫秒） */
const PLAY_INTERVAL = 1500;

/**
 * App 主组件
 * 
 * 状态管理：
 * - treeData: 当前的树数据（LeetCode 数组格式）
 * - currentStepIndex: 当前显示的算法步骤索引
 * - isPlaying: 是否正在自动播放
 */
function App() {
  // 树数据状态
  const [treeData, setTreeData] = useState<(number | null)[]>(DEFAULT_DATA);
  // 当前步骤索引
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  // 是否正在自动播放
  const [isPlaying, setIsPlaying] = useState(false);

  /**
   * 构建树和生成算法步骤
   * 
   * 使用 useMemo 缓存计算结果，只在 treeData 变化时重新计算
   * 注意：布局计算在 TreeVisualization 组件内部进行，以确保使用正确的容器尺寸
   */
  const { d3Tree, steps } = useMemo(() => {
    // 从数组构建二叉树
    const tree = buildTreeFromArray(treeData);
    // 转换为 D3 可视化格式（包含空节点）
    const d3Tree = convertToD3Tree(tree);
    // 生成算法执行步骤
    const steps = generateAlgorithmSteps(d3Tree);
    return { d3Tree, steps };
  }, [treeData]);

  const currentStep = steps[currentStepIndex] || null;

  // 播放控制
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, PLAY_INTERVAL);

    return () => clearInterval(timer);
  }, [isPlaying, steps.length]);

  const handleDataChange = useCallback((data: (number | null)[]) => {
    setTreeData(data);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, []);

  const handlePrevious = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
  }, [steps.length]);

  const handlePlayPause = useCallback(() => {
    if (currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  }, [currentStepIndex, steps.length]);

  const handleSeek = useCallback((step: number) => {
    setCurrentStepIndex(step);
    setIsPlaying(false);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, []);

  return (
    <div className="app">
      <Header />
      <InputPanel onDataChange={handleDataChange} currentData={treeData} />
      
      <main className="main-content">
        <TreeVisualization root={d3Tree} currentStep={currentStep} />
        <CodePanel currentStep={currentStep} />
      </main>

      <ControlPanel
        currentStep={currentStepIndex}
        totalSteps={steps.length}
        isPlaying={isPlaying}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onPlayPause={handlePlayPause}
        onSeek={handleSeek}
        onReset={handleReset}
      />

      <WeChatFloat />
    </div>
  );
}

export default App;
