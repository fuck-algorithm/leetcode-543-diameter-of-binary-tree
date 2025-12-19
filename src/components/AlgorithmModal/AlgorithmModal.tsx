/**
 * 算法思路弹窗组件
 * 
 * 以图文并茂的方式详细解释二叉树直径算法的核心思路，
 * 帮助用户理解算法的原理和实现。
 */

import { useEffect, useCallback } from 'react';
import './AlgorithmModal.css';

/**
 * AlgorithmModal 组件的属性接口
 */
interface AlgorithmModalProps {
  /** 弹窗是否打开 */
  isOpen: boolean;
  /** 关闭弹窗的回调函数 */
  onClose: () => void;
}

/**
 * AlgorithmModal 组件
 * 
 * 功能：
 * - 显示算法的详细思路讲解
 * - 包含问题定义、核心思路、递归过程、示例分析、复杂度分析等内容
 * - 支持 ESC 键关闭
 * - 点击遮罩层关闭
 * - 打开时禁止背景滚动
 */
export function AlgorithmModal({ isOpen, onClose }: AlgorithmModalProps) {
  /**
   * 键盘事件处理：ESC 键关闭弹窗
   */
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} title="关闭">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
          </svg>
        </button>
        
        <h2 className="modal-title">
          <span className="title-icon">💡</span>
          算法思路详解
        </h2>
        
        <div className="modal-body">
          <section className="algo-section">
            <h3>📌 问题定义</h3>
            <p>
              <strong>二叉树的直径</strong>是指树中任意两个节点之间最长路径的<strong>边数</strong>。
              这条路径可能经过根节点，也可能不经过。
            </p>
          </section>

          <section className="algo-section">
            <h3>🎯 核心思路</h3>
            <p>对于每个节点，经过该节点的最长路径 = <strong>左子树深度 + 右子树深度</strong></p>
            <div className="formula-box">
              <code>diameter = max(diameter, leftDepth + rightDepth)</code>
            </div>
            <p>我们需要遍历所有节点，找出经过每个节点的最长路径，取最大值即为答案。</p>
          </section>

          <section className="algo-section">
            <h3>🔄 递归过程</h3>
            <ol className="step-list">
              <li>
                <strong>递归计算深度</strong>：对于每个节点，递归计算其左右子树的深度
              </li>
              <li>
                <strong>更新直径</strong>：在每个节点处，用 leftDepth + rightDepth 更新全局最大直径
              </li>
              <li>
                <strong>返回深度</strong>：返回 max(leftDepth, rightDepth) + 1 作为当前子树的深度
              </li>
            </ol>
          </section>

          <section className="algo-section">
            <h3>📊 示例分析</h3>
            <div className="example-box">
              <pre>{`
    1
   / \\
  2   3
 / \\
4   5

节点4: 左深度=0, 右深度=0, 经过的路径=0
节点5: 左深度=0, 右深度=0, 经过的路径=0
节点2: 左深度=1, 右深度=1, 经过的路径=2
节点3: 左深度=0, 右深度=0, 经过的路径=0
节点1: 左深度=2, 右深度=1, 经过的路径=3 ✓

最长路径: 4 → 2 → 1 → 3 (或 5 → 2 → 1 → 3)
直径 = 3
              `}</pre>
            </div>
          </section>

          <section className="algo-section">
            <h3>⏱️ 复杂度分析</h3>
            <ul className="complexity-list">
              <li><strong>时间复杂度</strong>：O(n)，每个节点只访问一次</li>
              <li><strong>空间复杂度</strong>：O(h)，h为树的高度，递归栈的深度</li>
            </ul>
          </section>

          <section className="algo-section">
            <h3>💻 代码实现</h3>
            <div className="code-box">
              <pre>{`class Solution {
    private int diameter = 0;
    
    public int diameterOfBinaryTree(TreeNode root) {
        depth(root);
        return diameter;
    }
    
    private int depth(TreeNode node) {
        if (node == null) return 0;
        
        int leftDepth = depth(node.left);
        int rightDepth = depth(node.right);
        
        // 更新直径：经过当前节点的最长路径
        diameter = Math.max(diameter, leftDepth + rightDepth);
        
        // 返回当前子树的深度
        return Math.max(leftDepth, rightDepth) + 1;
    }
}`}</pre>
            </div>
          </section>

          <section className="algo-section">
            <h3>🔑 关键点</h3>
            <ul className="key-points">
              <li>直径是<strong>边数</strong>，不是节点数</li>
              <li>最长路径<strong>不一定经过根节点</strong></li>
              <li>利用后序遍历，在返回深度的同时更新直径</li>
              <li>使用全局变量记录最大直径，避免重复计算</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
