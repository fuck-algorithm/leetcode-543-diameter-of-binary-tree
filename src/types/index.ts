// 二叉树节点定义
export interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

// D3可视化用的节点
export interface D3TreeNode {
  id: string;
  val: number;
  x: number;
  y: number;
  left: D3TreeNode | null;
  right: D3TreeNode | null;
  parent: D3TreeNode | null;
  depth: number;
  highlighted: boolean;
  isOnDiameterPath: boolean;
}

// 算法执行步骤
export interface AlgorithmStep {
  stepIndex: number;
  description: string;
  currentNodeId: string | null;
  highlightedNodes: string[];
  highlightedEdges: [string, string][];
  diameterPath: string[];
  currentDiameter: number;
  variables: VariableState[];
  codeLineNumber: number;
  leftDepth?: number;
  rightDepth?: number;
}

// 变量状态
export interface VariableState {
  name: string;
  value: string;
  line: number;
}

// 代码行
export interface CodeLine {
  lineNumber: number;
  content: string;
  indent: number;
}
