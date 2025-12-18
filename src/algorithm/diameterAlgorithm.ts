/**
 * 二叉树直径算法模块
 * 
 * 本模块实现了LeetCode 543题"二叉树的直径"的算法可视化步骤生成
 * 
 * 算法核心思路：
 * 1. 二叉树的直径 = 任意两节点之间最长路径的边数
 * 2. 对于每个节点，经过该节点的最长路径 = 左子树深度 + 右子树深度
 * 3. 遍历所有节点，取最大值即为答案
 * 
 * 时间复杂度：O(n)，每个节点只访问一次
 * 空间复杂度：O(h)，h为树的高度，递归栈的深度
 */

import { D3TreeNode, AlgorithmStep, VariableState, AnimationType } from '../types';

/**
 * 二叉树直径算法的Java代码
 * 用于在代码面板中展示
 */
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

/**
 * 创建算法执行步骤的辅助函数
 * 
 * @param stepIndex - 步骤索引，从0开始
 * @param description - 步骤描述，用于展示给用户
 * @param currentNodeId - 当前正在处理的节点ID
 * @param highlightedNodes - 需要高亮显示的节点ID列表
 * @param highlightedEdges - 需要高亮显示的边，格式为[起点ID, 终点ID]
 * @param diameterPath - 当前直径路径上的节点ID列表
 * @param currentDiameter - 当前计算出的直径值
 * @param variables - 当前变量状态列表，用于代码面板显示
 * @param codeLineNumber - 当前执行到的代码行号
 * @param animationType - 动画类型，用于控制可视化效果
 * @param animationData - 动画相关的数据，如传递的值、比较结果等
 * @param leftDepth - 左子树深度（可选）
 * @param rightDepth - 右子树深度（可选）
 * @returns 完整的算法步骤对象
 */
function createStep(
  stepIndex: number,
  description: string,
  currentNodeId: string | null,
  highlightedNodes: string[],
  highlightedEdges: [string, string][],
  diameterPath: string[],
  currentDiameter: number,
  variables: VariableState[],
  codeLineNumber: number,
  animationType: AnimationType = 'none',
  animationData?: AlgorithmStep['animationData'],
  leftDepth?: number,
  rightDepth?: number
): AlgorithmStep {
  return {
    stepIndex,
    description,
    currentNodeId,
    highlightedNodes,
    highlightedEdges,
    diameterPath,
    currentDiameter,
    variables,
    codeLineNumber,
    animationType,
    animationData,
    leftDepth,
    rightDepth,
  };
}

/**
 * 生成算法执行步骤
 * 
 * 这是本模块的核心函数，它模拟算法的执行过程，
 * 为每一个关键操作生成一个可视化步骤。
 * 
 * 生成的步骤类型包括：
 * - 递归进入：进入一个新节点
 * - 递归退出：从一个节点返回
 * - 参数传递：向子节点传递参数
 * - 返回值传递：子节点向父节点返回深度值
 * - 比较操作：比较左右深度或更新直径
 * - 更新直径：当发现更大的直径时更新
 * 
 * @param root - D3格式的二叉树根节点
 * @returns 算法执行步骤数组
 */
export function generateAlgorithmSteps(root: D3TreeNode | null): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  let stepIndex = 0;
  let globalDiameter = 0;  // 全局直径变量，记录当前找到的最大直径
  const diameterPath: string[] = [];  // 记录直径路径上的节点

  // ========== 初始步骤 ==========
  // 算法开始，初始化直径为0
  steps.push(createStep(
    stepIndex++,
    '开始执行算法，初始化diameter = 0',
    null, [], [], [], 0,
    [{ name: 'diameter', value: '0', line: 2 }],
    2
  ));

  // ========== 空树处理 ==========
  // 如果根节点为空，直接返回直径0
  if (!root) {
    steps.push(createStep(
      stepIndex++,
      '根节点为空，返回直径0',
      null, [], [], [], 0,
      [{ name: 'diameter', value: '0', line: 2 }],
      5
    ));
    return steps;
  }

  // ========== 开始递归调用 ==========
  // 调用depth函数，传递根节点参数
  steps.push(createStep(
    stepIndex++,
    '调用depth(root)，传递根节点参数',
    root.id, [root.id], [], [], 0,
    [{ name: 'diameter', value: '0', line: 2 }],
    4,
    'param-pass',
    { toNodeId: root.id, value: `node=${root.val}` }
  ));

  /**
   * 递归处理节点
   * 
   * 这个内部函数模拟depth()函数的执行过程，
   * 为每个操作生成相应的可视化步骤。
   * 
   * 算法流程：
   * 1. 如果节点为空，返回深度0
   * 2. 递归计算左子树深度
   * 3. 递归计算右子树深度
   * 4. 更新全局直径（如果当前路径更长）
   * 5. 返回当前子树的深度
   * 
   * @param node - 当前处理的节点
   * @param path - 从根到当前节点的路径
   * @param parentId - 父节点ID，用于绘制返回值传递动画
   * @returns 以当前节点为根的子树深度
   */
  function processNode(node: D3TreeNode | null, path: string[], parentId: string | null): number {
    // ========== 空节点处理 ==========
    // 递归基：空节点返回深度0
    if (!node) {
      steps.push(createStep(
        stepIndex++,
        '节点为空，返回深度0',
        null, path, [], [...diameterPath], globalDiameter,
        [
          { name: 'diameter', value: String(globalDiameter), line: 2 },
          { name: 'return', value: '0', line: 11 },
        ],
        10,
        'return-value',
        { fromNodeId: parentId || undefined, value: 0 }
      ));
      return 0;
    }

    const currentPath = [...path, node.id];

    // ========== 递归进入 ==========
    // 进入当前节点，开始处理
    steps.push(createStep(
      stepIndex++,
      `📥 递归进入节点 ${node.val}`,
      node.id, currentPath, [], [...diameterPath], globalDiameter,
      [
        { name: 'diameter', value: String(globalDiameter), line: 2 },
        { name: 'node.val', value: String(node.val), line: 9 },
      ],
      9,
      'recursion-enter',
      { toNodeId: node.id, value: node.val }
    ));

    // ========== 处理左子树 ==========
    // 递归调用depth(node.left)，进入左子树
    steps.push(createStep(
      stepIndex++,
      `⬇️ 递归调用depth(node.left)，进入左子树`,
      node.id, currentPath,
      node.left ? [[node.id, node.left.id]] : [],
      [...diameterPath], globalDiameter,
      [
        { name: 'diameter', value: String(globalDiameter), line: 2 },
        { name: 'node.val', value: String(node.val), line: 9 },
      ],
      13,
      'param-pass',
      { fromNodeId: node.id, toNodeId: node.left?.id, value: node.left ? `node=${node.left.val}` : 'null' }
    ));

    // 递归计算左子树深度
    const leftDepth = processNode(node.left, currentPath, node.id);

    // 左子树返回深度值
    steps.push(createStep(
      stepIndex++,
      `⬆️ 左子树返回深度 ${leftDepth}`,
      node.id, currentPath,
      node.left ? [[node.id, node.left.id]] : [],
      [...diameterPath], globalDiameter,
      [
        { name: 'diameter', value: String(globalDiameter), line: 2 },
        { name: 'node.val', value: String(node.val), line: 9 },
        { name: 'leftDepth', value: String(leftDepth), line: 13 },
      ],
      13,
      'return-value',
      { fromNodeId: node.left?.id, toNodeId: node.id, value: leftDepth }
    ));

    // ========== 处理右子树 ==========
    // 递归调用depth(node.right)，进入右子树
    steps.push(createStep(
      stepIndex++,
      `⬇️ 递归调用depth(node.right)，进入右子树`,
      node.id, currentPath,
      node.right ? [[node.id, node.right.id]] : [],
      [...diameterPath], globalDiameter,
      [
        { name: 'diameter', value: String(globalDiameter), line: 2 },
        { name: 'node.val', value: String(node.val), line: 9 },
        { name: 'leftDepth', value: String(leftDepth), line: 13 },
      ],
      14,
      'param-pass',
      { fromNodeId: node.id, toNodeId: node.right?.id, value: node.right ? `node=${node.right.val}` : 'null' }
    ));

    // 递归计算右子树深度
    const rightDepth = processNode(node.right, currentPath, node.id);

    // 右子树返回深度值
    steps.push(createStep(
      stepIndex++,
      `⬆️ 右子树返回深度 ${rightDepth}`,
      node.id, currentPath,
      node.right ? [[node.id, node.right.id]] : [],
      [...diameterPath], globalDiameter,
      [
        { name: 'diameter', value: String(globalDiameter), line: 2 },
        { name: 'node.val', value: String(node.val), line: 9 },
        { name: 'leftDepth', value: String(leftDepth), line: 13 },
        { name: 'rightDepth', value: String(rightDepth), line: 14 },
      ],
      14,
      'return-value',
      { fromNodeId: node.right?.id, toNodeId: node.id, value: rightDepth }
    ));

    // ========== 更新直径 ==========
    // 计算经过当前节点的路径长度，并与全局直径比较
    const newDiameter = leftDepth + rightDepth;
    const oldDiameter = globalDiameter;
    const shouldUpdate = newDiameter > globalDiameter;

    // 比较操作：leftDepth + rightDepth vs diameter
    steps.push(createStep(
      stepIndex++,
      `🔄 比较: leftDepth(${leftDepth}) + rightDepth(${rightDepth}) = ${newDiameter} vs diameter(${oldDiameter})`,
      node.id, currentPath, [], [...diameterPath], globalDiameter,
      [
        { name: 'diameter', value: String(globalDiameter), line: 2 },
        { name: 'leftDepth + rightDepth', value: String(newDiameter), line: 16 },
      ],
      16,
      'compare',
      { compareLeft: newDiameter, compareRight: oldDiameter, compareResult: shouldUpdate ? '>' : '≤' }
    ));

    // 如果发现更大的直径，更新全局变量
    if (shouldUpdate) {
      globalDiameter = newDiameter;
      diameterPath.length = 0;
      diameterPath.push(node.id);
    }

    // 显示直径更新结果
    steps.push(createStep(
      stepIndex++,
      shouldUpdate
        ? `✅ 更新直径: ${oldDiameter} → ${globalDiameter}`
        : `⏸️ 直径保持不变: ${globalDiameter}`,
      node.id, currentPath, [], [...diameterPath], globalDiameter,
      [
        { name: 'diameter', value: String(globalDiameter), line: 2 },
        { name: 'node.val', value: String(node.val), line: 9 },
        { name: 'leftDepth', value: String(leftDepth), line: 13 },
        { name: 'rightDepth', value: String(rightDepth), line: 14 },
      ],
      16,
      'update-diameter',
      { value: globalDiameter },
      leftDepth,
      rightDepth
    ));

    // ========== 计算返回值 ==========
    // 返回当前子树的深度 = max(左深度, 右深度) + 1
    const depth = Math.max(leftDepth, rightDepth) + 1;

    steps.push(createStep(
      stepIndex++,
      `🔢 计算返回值: max(${leftDepth}, ${rightDepth}) + 1 = ${depth}`,
      node.id, currentPath, [], [...diameterPath], globalDiameter,
      [
        { name: 'diameter', value: String(globalDiameter), line: 2 },
        { name: 'max(leftDepth, rightDepth)', value: String(Math.max(leftDepth, rightDepth)), line: 18 },
        { name: 'return', value: String(depth), line: 18 },
      ],
      18,
      'compare',
      { compareLeft: leftDepth, compareRight: rightDepth, compareResult: `max=${Math.max(leftDepth, rightDepth)}` }
    ));

    // ========== 递归退出 ==========
    // 从当前节点返回，将深度值传递给父节点
    steps.push(createStep(
      stepIndex++,
      `📤 递归退出节点 ${node.val}，返回深度 ${depth}`,
      node.id, currentPath, [], [...diameterPath], globalDiameter,
      [
        { name: 'diameter', value: String(globalDiameter), line: 2 },
        { name: 'return', value: String(depth), line: 18 },
      ],
      18,
      'recursion-exit',
      { fromNodeId: node.id, toNodeId: parentId || undefined, value: depth }
    ));

    return depth;
  }

  // 从根节点开始递归处理
  processNode(root, [], null);

  // ========== 算法结束 ==========
  // 显示最终结果
  steps.push(createStep(
    stepIndex++,
    `🎉 算法执行完毕，二叉树的直径为 ${globalDiameter}`,
    null, [], [], [...diameterPath], globalDiameter,
    [
      { name: 'diameter', value: String(globalDiameter), line: 2 },
      { name: 'return', value: String(globalDiameter), line: 5 },
    ],
    5
  ));

  return steps;
}

/**
 * 解析代码为行数组
 * 
 * 将算法代码字符串解析为带行号的数组，
 * 用于代码面板的逐行显示和高亮。
 * 
 * @returns 包含行号和内容的对象数组
 */
export function parseCodeLines(): { lineNumber: number; content: string }[] {
  return ALGORITHM_CODE.split('\n').map((content, index) => ({
    lineNumber: index + 1,
    content,
  }));
}
