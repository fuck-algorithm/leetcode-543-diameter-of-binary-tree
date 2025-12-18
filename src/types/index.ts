/**
 * 类型定义模块
 * 
 * 本模块定义了项目中使用的所有TypeScript类型和接口
 */

/**
 * 二叉树节点定义
 * 
 * 这是最基本的二叉树节点结构，与LeetCode题目中的定义一致
 */
export interface TreeNode {
  /** 节点值 */
  val: number;
  /** 左子节点 */
  left: TreeNode | null;
  /** 右子节点 */
  right: TreeNode | null;
}

/**
 * D3可视化用的节点
 * 
 * 在基本TreeNode的基础上，添加了可视化所需的额外属性：
 * - 位置信息（x, y坐标）
 * - 唯一标识符（用于动画和数据绑定）
 * - 状态信息（高亮、是否在直径路径上）
 */
export interface D3TreeNode {
  /** 节点唯一标识符，格式如 '0', '0-L', '0-R', '0-L-L' 等 */
  id: string;
  /** 节点值 */
  val: number;
  /** 节点在画布上的x坐标 */
  x: number;
  /** 节点在画布上的y坐标 */
  y: number;
  /** 左子节点 */
  left: D3TreeNode | null;
  /** 右子节点 */
  right: D3TreeNode | null;
  /** 父节点引用，用于绘制边和动画 */
  parent: D3TreeNode | null;
  /** 节点深度，根节点为0 */
  depth: number;
  /** 是否高亮显示 */
  highlighted: boolean;
  /** 是否在直径路径上 */
  isOnDiameterPath: boolean;
}

/**
 * 动画类型
 * 
 * 定义了算法可视化中的各种动画效果类型：
 * - none: 无动画
 * - recursion-enter: 递归进入节点
 * - recursion-exit: 递归退出节点
 * - return-value: 返回值向上传递
 * - compare: 比较操作（如比较左右深度）
 * - update-diameter: 更新直径值
 * - param-pass: 参数向下传递
 */
export type AnimationType = 
  | 'none'
  | 'recursion-enter'    // 递归进入
  | 'recursion-exit'     // 递归退出
  | 'return-value'       // 返回值传递
  | 'compare'            // 比较操作
  | 'update-diameter'    // 更新直径
  | 'param-pass';        // 参数传递

/**
 * 算法执行步骤
 * 
 * 每个步骤代表算法执行过程中的一个关键时刻，
 * 包含了该时刻的所有状态信息，用于可视化展示
 */
export interface AlgorithmStep {
  /** 步骤索引，从0开始 */
  stepIndex: number;
  /** 步骤描述，展示给用户的文字说明 */
  description: string;
  /** 当前正在处理的节点ID */
  currentNodeId: string | null;
  /** 需要高亮显示的节点ID列表 */
  highlightedNodes: string[];
  /** 需要高亮显示的边，格式为[起点ID, 终点ID] */
  highlightedEdges: [string, string][];
  /** 当前直径路径上的节点ID列表 */
  diameterPath: string[];
  /** 当前计算出的直径值 */
  currentDiameter: number;
  /** 当前变量状态列表，用于代码面板显示 */
  variables: VariableState[];
  /** 当前执行到的代码行号 */
  codeLineNumber: number;
  /** 左子树深度（可选，用于显示深度信息） */
  leftDepth?: number;
  /** 右子树深度（可选，用于显示深度信息） */
  rightDepth?: number;
  /** 动画类型 */
  animationType?: AnimationType;
  /** 动画相关的数据 */
  animationData?: {
    /** 动画起始节点ID */
    fromNodeId?: string;
    /** 动画目标节点ID */
    toNodeId?: string;
    /** 传递的值（用于显示在动画路径上） */
    value?: string | number;
    /** 比较操作的左值 */
    compareLeft?: number;
    /** 比较操作的右值 */
    compareRight?: number;
    /** 比较结果（如 '>', '≤', 'max=2' 等） */
    compareResult?: string;
  };
}

/**
 * 变量状态
 * 
 * 用于在代码面板中显示当前变量的值
 */
export interface VariableState {
  /** 变量名 */
  name: string;
  /** 变量值（字符串形式） */
  value: string;
  /** 变量所在的代码行号 */
  line: number;
}

/**
 * 代码行
 * 
 * 用于代码面板的逐行显示
 */
export interface CodeLine {
  /** 行号 */
  lineNumber: number;
  /** 代码内容 */
  content: string;
  /** 缩进级别 */
  indent: number;
}
