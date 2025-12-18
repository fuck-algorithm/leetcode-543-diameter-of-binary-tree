import { TreeNode, D3TreeNode } from '../types';

// 从数组构建二叉树（LeetCode格式）
export function buildTreeFromArray(arr: (number | null)[]): TreeNode | null {
  if (!arr || arr.length === 0 || arr[0] === null) return null;

  const root: TreeNode = { val: arr[0], left: null, right: null };
  const queue: TreeNode[] = [root];
  let i = 1;

  while (queue.length > 0 && i < arr.length) {
    const node = queue.shift()!;

    if (i < arr.length && arr[i] !== null) {
      node.left = { val: arr[i]!, left: null, right: null };
      queue.push(node.left);
    }
    i++;

    if (i < arr.length && arr[i] !== null) {
      node.right = { val: arr[i]!, left: null, right: null };
      queue.push(node.right);
    }
    i++;
  }

  return root;
}

// 将二叉树转换为D3可视化节点
export function convertToD3Tree(
  node: TreeNode | null,
  id: string = '0',
  depth: number = 0,
  parent: D3TreeNode | null = null
): D3TreeNode | null {
  if (!node) return null;

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

  d3Node.left = convertToD3Tree(node.left, `${id}-L`, depth + 1, d3Node);
  d3Node.right = convertToD3Tree(node.right, `${id}-R`, depth + 1, d3Node);

  return d3Node;
}

// 计算树的布局位置
export function calculateTreeLayout(
  root: D3TreeNode | null,
  width: number,
  height: number
): void {
  if (!root) return;

  const maxDepth = getMaxDepth(root);
  const levelHeight = height / (maxDepth + 2);

  function assignPositions(
    node: D3TreeNode | null,
    left: number,
    right: number,
    depth: number
  ): void {
    if (!node) return;

    node.x = (left + right) / 2;
    node.y = (depth + 1) * levelHeight;

    const mid = (left + right) / 2;
    assignPositions(node.left, left, mid, depth + 1);
    assignPositions(node.right, mid, right, depth + 1);
  }

  assignPositions(root, 0, width, 0);
}

// 获取树的最大深度
export function getMaxDepth(node: D3TreeNode | null): number {
  if (!node) return 0;
  return 1 + Math.max(getMaxDepth(node.left), getMaxDepth(node.right));
}

// 获取所有节点
export function getAllNodes(root: D3TreeNode | null): D3TreeNode[] {
  if (!root) return [];
  return [root, ...getAllNodes(root.left), ...getAllNodes(root.right)];
}

// 获取所有边
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

// 解析用户输入的数组字符串
export function parseArrayInput(input: string): (number | null)[] | null {
  try {
    const trimmed = input.trim();
    if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) {
      return null;
    }
    
    const content = trimmed.slice(1, -1);
    if (content.trim() === '') return [];
    
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

// 验证数组是否能构成有效的二叉树
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

// 生成随机二叉树数组
export function generateRandomTree(nodeCount: number): (number | null)[] {
  const count = Math.min(Math.max(nodeCount, 1), 15);
  const result: (number | null)[] = [];
  
  // 生成根节点
  result.push(Math.floor(Math.random() * 201) - 100);
  
  // 生成其他节点
  for (let i = 1; i < count; i++) {
    // 随机决定是否为null（约20%概率）
    if (Math.random() < 0.2 && i > 2) {
      result.push(null);
    } else {
      result.push(Math.floor(Math.random() * 201) - 100);
    }
  }
  
  return result;
}
