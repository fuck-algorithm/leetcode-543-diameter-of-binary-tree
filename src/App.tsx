import { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header/Header';
import { InputPanel } from './components/InputPanel/InputPanel';
import { TreeVisualization } from './components/TreeVisualization/TreeVisualization';
import { CodePanel } from './components/CodePanel/CodePanel';
import { ControlPanel } from './components/ControlPanel/ControlPanel';
import { WeChatFloat } from './components/WeChatFloat/WeChatFloat';

import { buildTreeFromArray, convertToD3Tree, calculateTreeLayout } from './utils/treeUtils';
import { generateAlgorithmSteps } from './algorithm/diameterAlgorithm';
import './App.css';

const DEFAULT_DATA: (number | null)[] = [1, 2, 3, 4, 5];
const PLAY_INTERVAL = 1500;

function App() {
  const [treeData, setTreeData] = useState<(number | null)[]>(DEFAULT_DATA);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // 构建树和生成步骤
  const { d3Tree, steps } = useMemo(() => {
    const tree = buildTreeFromArray(treeData);
    const d3Tree = convertToD3Tree(tree);
    
    // 计算布局
    if (d3Tree) {
      calculateTreeLayout(d3Tree, 500, 300);
    }
    
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
