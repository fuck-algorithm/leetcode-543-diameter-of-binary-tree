/**
 * 二叉树工具函数模块
 * 
 * 本模块提供了二叉树相关的工具函数，包括：
 * - 从数组构建二叉树
 * - 转换为D3可视化格式
 * - 计算树的布局位置
 * - 解析和验证用户输入
 * - 生成随机测试数据
 */

import { TreeNode, D3TreeNode } from '../types';

/**
 * 从数组构建二叉树（LeetCode格式）
 * 
 * LeetCode使用层序遍历的方式表示二叉树：
 * - 数组第一个元素是根节点
 * - 对于索引i的节点，其左子节点在2i+1，右子节点在2i+2
 * - null表示该位置没有节点
 * 
 * 示例：[1,2,3,4,5] 表示：
 *       1
 *      / \
 *     2   3
 *    / \
 *   4   5
 * 
 * @param arr - LeetCode格式的数组，元素为数字或null
 * @returns 构建好的二叉树根节点，如果数组为空则返回null
 */
export function buildTreeFromArray(arr: (number | null)[]): TreeNode | null {
  // 空数组或根节点为null的情况
  if (!arr || arr.length === 0 || arr[0] === null) return null;

  // 创建根节点
  const root: TreeNode = { val: arr[0], left: null, right: null };
  
  // 使用队列进行层序构建
  const queue: TreeNode[] = [root];
  let i = 1;

  while (queue.length > 0 && i < arr.length) {
    const node = queue.shift()!;

    // 构建左子节点
    if (i < arr.length && arr[i] !== null) {
      node.left = { val: arr[i]!, left: null, right: null };
      queue.push(node.left);
    }
    i++;

    // 构建右子节点
    if (i < arr.length && arr[i] !== null) {
      node.right = { val: arr[i]!, left: null, right: null };
      queue.push(node.right);
    }
    i++;
  }

  return root;
}

/**
 * 将二叉树转换为D3可视化节点
 * 
 * D3TreeNode包含了可视化所需的额外信息：
 * - id: 唯一标识符，用于动画和高亮
 * - x, y: 节点在画布上的坐标
 * - parent: 父节点引用，用于绘制边
 * - depth: 节点深度，用于布局计算
 * - highlighted: 是否高亮显示
 * - isOnDiameterPath: 是否在直径路径上
 * 
 * @param node - 原始二叉树节点
 * @param id - 节点ID，默认为'0'（根节点）
 * @param depth - 节点深度，默认为0
 * @param parent - 父节点引用，默认为null
 * @returns D3格式的树节点
 */
export function convertToD3Tree(
  node: TreeNode | null,
  id: string = '0',
  depth: number = 0,
  parent: D3TreeNode | null = null
): D3TreeNode | null {
  if (!node) return null;

  // 创建D3节点，初始坐标为0，后续由布局算法计算
  const d3Node: D3TreeNode = {
    id,
    val: node.val,
    x: 0,
    y: 0,
    left: null,
    right: null,
    parent,
    depth,
    highlighted: false,
    isOnDiameterPath: false,
  };

  // 递归转换子节点
  // 左子节点ID后缀为'-L'，右子节点ID后缀为'-R'
  d3Node.left = convertToD3Tree(node.left, `${id}-L`, depth + 1, d3Node);
  d3Node.right = convertToD3Tree(node.right, `${id}-R`, depth + 1, d3Node);

  return d3Node;
}

/**
 * 计算树的布局位置
 * 
 * 使用改进的布局算法使树在画布中央显示。
 * 
 * 算法思路：
 * 1. 首先使用后序遍历计算每个节点的相对x坐标
 *    - 叶子节点按顺序排列
 *    - 父节点位于子节点中间
 * 2. 计算树的实际边界（最小/最大x坐标）
 * 3. 将整棵树平移到画布中央
 * 
 * @param root - D3格式的树根节点
 * @param width - 画布宽度
 * @param height - 画布高度
 */
export function calculateTreeLayout(
  root: D3TreeNode | null,
  width: number,
  height: number
): void {
  if (!root) return;

  const maxDepth = getMaxDepth(root);
  // 节点之间的最小水平间距
  const nodeSpacing = 50;
  // 层级之间的垂直间距，根据树的深度自适应
  const levelHeight = Math.min(80, (height - 100) / (maxDepth + 1));
  // 顶部边距，留出空间显示状态标签
  const topPadding = 50;

  // 用于追踪下一个可用的x坐标
  let nextX = 0;

  /**
   * 后序遍历计算每个节点的x坐标
   * 
   * 算法逻辑：
   * - 叶子节点：分配下一个可用的x坐标
   * - 只有左子树：父节点在左子树右边界
   * - 只有右子树：父节点在右子树左边界
   * - 有两个子树：父节点在两个子树中间
   * 
   * @param node - 当前处理的节点
   * @returns 子树的边界 {minX, maxX}，用于父节点定位
   */
  function calculateXPositions(node: D3TreeNode | null): { minX: number; maxX: number } | null {
    if (!node) return null;

    // 先处理子树（后序遍历）
    const leftBounds = calculateXPositions(node.left);
    const rightBounds = calculateXPositions(node.right);

    if (!leftBounds && !rightBounds) {
      // 叶子节点：分配下一个可用的x坐标
      node.x = nextX;
      nextX += nodeSpacing;
      return { minX: node.x, maxX: node.x };
    } else if (!leftBounds) {
      // 只有右子树：父节点在右子树左边界
      node.x = rightBounds!.minX;
      return { minX: node.x, maxX: rightBounds!.maxX };
    } else if (!rightBounds) {
      // 只有左子树：父节点在左子树右边界
      node.x = leftBounds.maxX;
      return { minX: leftBounds.minX, maxX: node.x };
    } else {
      // 有两个子树：父节点在两个子树中间
      node.x = (leftBounds.maxX + rightBounds.minX) / 2;
      return { minX: leftBounds.minX, maxX: rightBounds.maxX };
    }
  }

  /**
   * 计算y坐标（按层级）
   * 
   * @param node - 当前处理的节点
   * @param depth - 当前深度
   */
  function calculateYPositions(node: D3TreeNode | null, depth: number): void {
    if (!node) return;
    node.y = topPadding + depth * levelHeight;
    calculateYPositions(node.left, depth + 1);
    calculateYPositions(node.right, depth + 1);
  }

  // 执行位置计算
  const bounds = calculateXPositions(root);
  calculateYPositions(root, 0);

  if (!bounds) return;

  // 计算树的实际宽度和需要的偏移量，使树居中
  const treeWidth = bounds.maxX - bounds.minX;
  const offsetX = (width - treeWidth) / 2 - bounds.minX;

  /**
   * 应用偏移量，将树移动到画布中央
   * 
   * @param node - 当前处理的节点
   */
  function applyOffset(node: D3TreeNode | null): void {
    if (!node) return;
    node.x += offsetX;
    applyOffset(node.left);
    applyOffset(node.right);
  }

  applyOffset(root);
}

/**
 * 获取树的最大深度
 * 
 * @param node - 树节点
 * @returns 树的最大深度，空树返回0
 */
export function getMaxDepth(node: D3TreeNode | null): number {
  if (!node) return 0;
  return 1 + Math.max(getMaxDepth(node.left), getMaxDepth(node.right));
}

/**
 * 获取所有节点
 * 
 * 使用前序遍历收集所有节点，用于D3绑定数据
 * 
 * @param root - 树根节点
 * @returns 所有节点的数组
 */
export function getAllNodes(root: D3TreeNode | null): D3TreeNode[] {
  if (!root) return [];
  return [root, ...getAllNodes(root.left), ...getAllNodes(root.right)];
}

/**
 * 获取所有边
 * 
 * 收集所有父子节点对，用于绘制连接线
 * 
 * @param root - 树根节点
 * @returns 边的数组，每条边是[父节点, 子节点]的元组
 */
export function getAllEdges(root: D3TreeNode | null): [D3TreeNode, D3TreeNode][] {
  if (!root) return [];
  const edges: [D3TreeNode, D3TreeNode][] = [];
  
  if (root.left) {
    edges.push([root, root.left]);
    edges.push(...getAllEdges(root.left));
  }
  if (root.right) {
    edges.push([root, root.right]);
    edges.push(...getAllEdges(root.right));
  }
  
  return edges;
}

/**
 * 解析用户输入的数组字符串
 * 
 * 支持的格式：
 * - [1,2,3,4,5]
 * - [1, 2, null, 3]
 * - [1,null,2,null,3]
 * 
 * @param input - 用户输入的字符串
 * @returns 解析后的数组，解析失败返回null
 */
export function parseArrayInput(input: string): (number | null)[] | null {
  try {
    const trimmed = input.trim();
    
    // 检查是否以方括号包围
    if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) {
      return null;
    }
    
    // 提取方括号内的内容
    const content = trimmed.slice(1, -1);
    if (content.trim() === '') return [];
    
    // 按逗号分割并解析每个元素
    const parts = content.split(',').map(s => s.trim());
    const result: (number | null)[] = [];
    
    for (const part of parts) {
      if (part === 'null' || part === '') {
        result.push(null);
      } else {
        const num = parseInt(part, 10);
        if (isNaN(num)) return null;
        result.push(num);
      }
    }
    
    return result;
  } catch {
    return null;
  }
}

/**
 * 验证数组是否能构成有效的二叉树
 * 
 * 验证规则：
 * - 数组不能为空
 * - 根节点不能为null
 * - 节点值范围：-100 到 100
 * - 节点数量不超过10000
 * 
 * @param arr - 待验证的数组
 * @returns 是否有效
 */
export function validateTreeArray(arr: (number | null)[]): boolean {
  if (!arr || arr.length === 0) return false;
  if (arr[0] === null) return false;
  
  // 检查数值范围
  for (const val of arr) {
    if (val !== null && (val < -100 || val > 100)) {
      return false;
    }
  }
  
  // 检查节点数量
  if (arr.length > 10000) return false;
  
  return true;
}

/**
 * 生成随机二叉树数组
 * 
 * 用于"随机生成"功能，生成一个随机的二叉树数组
 * 
 * @param nodeCount - 期望的节点数量（实际会限制在1-15之间）
 * @returns 随机生成的数组
 */
export function generateRandomTree(nodeCount: number): (number | null)[] {
  // 限制节点数量在合理范围内
  const count = Math.min(Math.max(nodeCount, 1), 15);
  const result: (number | null)[] = [];
  
  // 生成根节点（-100到100之间的随机数）
  result.push(Math.floor(Math.random() * 201) - 100);
  
  // 生成其他节点
  for (let i = 1; i < count; i++) {
    // 随机决定是否为null（约20%概率，但前几个节点不为null）
    if (Math.random() < 0.2 && i > 2) {
      result.push(null);
    } else {
      result.push(Math.floor(Math.random() * 201) - 100);
    }
  }
  
  return result;
}
