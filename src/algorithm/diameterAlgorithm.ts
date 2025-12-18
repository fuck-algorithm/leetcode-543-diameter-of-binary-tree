import { D3TreeNode, AlgorithmStep, VariableState } from '../types';

// 二叉树直径算法的Java代码
export const ALGORITHM_CODE = `class Solution {
    private int diameter = 0;
    
    public int diameterOfBinaryTree(TreeNode root) {
        depth(root);
        return diameter;
    }
    
    private int depth(TreeNode node) {
        if (node == null) {
            return 0;
        }
        
        int leftDepth = depth(node.left);
        int rightDepth = depth(node.right);
        
        diameter = Math.max(diameter, leftDepth + rightDepth);
        
        return Math.max(leftDepth, rightDepth) + 1;
    }
}`;

// 生成算法执行步骤
export function generateAlgorithmSteps(root: D3TreeNode | null): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  let stepIndex = 0;
  let globalDiameter = 0;
  const diameterPath: string[] = [];
  const nodeDepths: Map<string, number> = new Map();

  // 初始步骤
  steps.push({
    stepIndex: stepIndex++,
    description: '开始执行算法，初始化diameter = 0',
    currentNodeId: null,
    highlightedNodes: [],
    highlightedEdges: [],
    diameterPath: [],
    currentDiameter: 0,
    variables: [{ name: 'diameter', value: '0', line: 2 }],
    codeLineNumber: 2,
  });

  if (!root) {
    steps.push({
      stepIndex: stepIndex++,
      description: '根节点为空，返回直径0',
      currentNodeId: null,
      highlightedNodes: [],
      highlightedEdges: [],
      diameterPath: [],
      currentDiameter: 0,
      variables: [{ name: 'diameter', value: '0', line: 2 }],
      codeLineNumber: 5,
    });
    return steps;
  }

  // 调用depth函数
  steps.push({
    stepIndex: stepIndex++,
    description: '调用depth(root)计算深度',
    currentNodeId: root.id,
    highlightedNodes: [root.id],
    highlightedEdges: [],
    diameterPath: [],
    currentDiameter: 0,
    variables: [{ name: 'diameter', value: '0', line: 2 }],
    codeLineNumber: 4,
  });

  // 递归遍历生成步骤
  function processNode(node: D3TreeNode | null, path: string[]): number {
    if (!node) {
      steps.push({
        stepIndex: stepIndex++,
        description: '节点为空，返回深度0',
        currentNodeId: null,
        highlightedNodes: path,
        highlightedEdges: [],
        diameterPath: [...diameterPath],
        currentDiameter: globalDiameter,
        variables: [
          { name: 'diameter', value: String(globalDiameter), line: 2 },
          { name: 'return', value: '0', line: 11 },
        ],
        codeLineNumber: 10,
      });
      return 0;
    }

    const currentPath = [...path, node.id];

    // 访问当前节点
    steps.push({
      stepIndex: stepIndex++,
      description: `访问节点 ${node.val}，检查是否为空`,
      currentNodeId: node.id,
      highlightedNodes: currentPath,
      highlightedEdges: [],
      diameterPath: [...diameterPath],
      currentDiameter: globalDiameter,
      variables: [
        { name: 'diameter', value: String(globalDiameter), line: 2 },
        { name: 'node.val', value: String(node.val), line: 9 },
      ],
      codeLineNumber: 9,
    });

    // 递归计算左子树深度
    steps.push({
      stepIndex: stepIndex++,
      description: `计算节点 ${node.val} 的左子树深度`,
      currentNodeId: node.id,
      highlightedNodes: currentPath,
      highlightedEdges: node.left ? [[node.id, node.left.id]] : [],
      diameterPath: [...diameterPath],
      currentDiameter: globalDiameter,
      variables: [
        { name: 'diameter', value: String(globalDiameter), line: 2 },
        { name: 'node.val', value: String(node.val), line: 9 },
      ],
      codeLineNumber: 13,
    });

    const leftDepth = processNode(node.left, currentPath);

    // 递归计算右子树深度
    steps.push({
      stepIndex: stepIndex++,
      description: `计算节点 ${node.val} 的右子树深度`,
      currentNodeId: node.id,
      highlightedNodes: currentPath,
      highlightedEdges: node.right ? [[node.id, node.right.id]] : [],
      diameterPath: [...diameterPath],
      currentDiameter: globalDiameter,
      variables: [
        { name: 'diameter', value: String(globalDiameter), line: 2 },
        { name: 'node.val', value: String(node.val), line: 9 },
        { name: 'leftDepth', value: String(leftDepth), line: 13 },
      ],
      codeLineNumber: 14,
    });

    const rightDepth = processNode(node.right, currentPath);

    // 更新直径
    const newDiameter = leftDepth + rightDepth;
    const oldDiameter = globalDiameter;
    if (newDiameter > globalDiameter) {
      globalDiameter = newDiameter;
      // 更新直径路径
      diameterPath.length = 0;
      diameterPath.push(node.id);
    }

    const variables: VariableState[] = [
      { name: 'diameter', value: String(globalDiameter), line: 2 },
      { name: 'node.val', value: String(node.val), line: 9 },
      { name: 'leftDepth', value: String(leftDepth), line: 13 },
      { name: 'rightDepth', value: String(rightDepth), line: 14 },
      { name: 'leftDepth + rightDepth', value: String(newDiameter), line: 16 },
    ];

    steps.push({
      stepIndex: stepIndex++,
      description: newDiameter > oldDiameter
        ? `节点 ${node.val}: 左深度=${leftDepth}, 右深度=${rightDepth}, 路径长度=${newDiameter} > ${oldDiameter}，更新直径为 ${globalDiameter}`
        : `节点 ${node.val}: 左深度=${leftDepth}, 右深度=${rightDepth}, 路径长度=${newDiameter} ≤ ${oldDiameter}，直径保持 ${globalDiameter}`,
      currentNodeId: node.id,
      highlightedNodes: currentPath,
      highlightedEdges: [],
      diameterPath: [...diameterPath],
      currentDiameter: globalDiameter,
      variables,
      codeLineNumber: 16,
      leftDepth,
      rightDepth,
    });

    // 返回深度
    const depth = Math.max(leftDepth, rightDepth) + 1;
    nodeDepths.set(node.id, depth);

    steps.push({
      stepIndex: stepIndex++,
      description: `节点 ${node.val} 返回深度 ${depth} = max(${leftDepth}, ${rightDepth}) + 1`,
      currentNodeId: node.id,
      highlightedNodes: currentPath,
      highlightedEdges: [],
      diameterPath: [...diameterPath],
      currentDiameter: globalDiameter,
      variables: [
        { name: 'diameter', value: String(globalDiameter), line: 2 },
        { name: 'return', value: String(depth), line: 18 },
      ],
      codeLineNumber: 18,
    });

    return depth;
  }

  processNode(root, []);

  // 最终结果
  steps.push({
    stepIndex: stepIndex++,
    description: `算法执行完毕，二叉树的直径为 ${globalDiameter}`,
    currentNodeId: null,
    highlightedNodes: [],
    highlightedEdges: [],
    diameterPath: [...diameterPath],
    currentDiameter: globalDiameter,
    variables: [
      { name: 'diameter', value: String(globalDiameter), line: 2 },
      { name: 'return', value: String(globalDiameter), line: 5 },
    ],
    codeLineNumber: 5,
  });

  return steps;
}

// 解析代码为行数组
export function parseCodeLines(): { lineNumber: number; content: string }[] {
  return ALGORITHM_CODE.split('\n').map((content, index) => ({
    lineNumber: index + 1,
    content,
  }));
}
