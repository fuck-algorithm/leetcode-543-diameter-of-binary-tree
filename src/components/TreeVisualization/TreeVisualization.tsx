/**
 * 树可视化组件
 * 
 * 使用 D3.js 绘制二叉树，并根据算法执行步骤显示动画效果。
 * 
 * 主要功能：
 * - 绘制二叉树节点和边
 * - 显示空节点（NULL）用虚线表示
 * - 支持缩放和拖拽
 * - 根据算法步骤高亮节点和边
 * - 显示各种动画效果（递归进入/退出、返回值传递、比较、更新直径等）
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { D3TreeNode, AlgorithmStep, AnimationType } from '../../types';
import { getAllNodes, getAllEdges, getRealNodes, getNullNodes, calculateTreeLayout } from '../../utils/treeUtils';
import './TreeVisualization.css';

/**
 * TreeVisualization 组件的属性接口
 */
interface TreeVisualizationProps {
  /** D3格式的树根节点 */
  root: D3TreeNode | null;
  /** 当前算法执行步骤 */
  currentStep: AlgorithmStep | null;
}

// ========== 缩放配置常量 ==========
/** 最小缩放比例 */
const ZOOM_MIN = 0.3;
/** 最大缩放比例 */
const ZOOM_MAX = 3;
/** 每次缩放的步进值 */
const ZOOM_STEP = 0.2;

/**
 * 根据动画类型获取对应的颜色
 * 
 * 不同的动画类型使用不同的颜色，便于用户区分：
 * - 递归进入：青色
 * - 递归退出：红色
 * - 返回值传递：紫色
 * - 比较操作：黄色
 * - 更新直径：绿色
 * - 参数传递：蓝色
 * 
 * @param type - 动画类型
 * @returns 对应的颜色值
 */
function getAnimationColor(type: AnimationType): string {
  switch (type) {
    case 'recursion-enter': return '#4ecdc4';  // 青色 - 递归进入
    case 'recursion-exit': return '#ff6b6b';   // 红色 - 递归退出
    case 'return-value': return '#a78bfa';     // 紫色 - 返回值传递
    case 'compare': return '#fbbf24';          // 黄色 - 比较操作
    case 'update-diameter': return '#22c55e';  // 绿色 - 更新直径
    case 'param-pass': return '#60a5fa';       // 蓝色 - 参数传递
    default: return '#ffa116';                 // 橙色 - 默认
  }
}

/**
 * TreeVisualization 组件
 * 
 * 功能：
 * - 使用 SVG 绘制二叉树
 * - 支持鼠标拖拽和滚轮缩放
 * - 根据算法步骤显示节点高亮和动画效果
 * - 显示当前步骤信息和直径值
 */
export function TreeVisualization({ root, currentStep }: TreeVisualizationProps) {
  // SVG 元素引用
  const svgRef = useRef<SVGSVGElement>(null);
  // 容器 div 引用，用于获取尺寸
  const containerRef = useRef<HTMLDivElement>(null);
  // D3 缩放行为引用
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  // D3 绑定的主绘图组引用
  const gRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  
  // 当前缩放比例状态，用于在界面上显示百分比
  const [zoomScale, setZoomScale] = useState(1);

  // 重置视图到初始状态
  const handleResetView = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(
      zoomRef.current.transform,
      d3.zoomIdentity
    );
  }, []);

  // 放大
  const handleZoomIn = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(200).call(
      zoomRef.current.scaleBy,
      1 + ZOOM_STEP
    );
  }, []);

  // 缩小
  const handleZoomOut = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(200).call(
      zoomRef.current.scaleBy,
      1 - ZOOM_STEP
    );
  }, []);

  // 初始化SVG和缩放行为（只执行一次）
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    svg.attr('width', width).attr('height', height);

    // 清除旧内容
    svg.selectAll('*').remove();

    // 添加箭头标记定义
    const defs = svg.append('defs');
    
    // 为不同动画类型创建箭头
    const arrowColors = ['#4ecdc4', '#ff6b6b', '#a78bfa', '#60a5fa', '#ffa116'];
    arrowColors.forEach((color, i) => {
      defs.append('marker')
        .attr('id', `arrow-${i}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 8)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', color);
    });

    // 创建主绘图组
    const g = svg.append('g').attr('class', 'tree-container');
    gRef.current = g;

    // 创建缩放行为
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([ZOOM_MIN, ZOOM_MAX])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomScale(event.transform.k);
      });

    zoomRef.current = zoom;
    svg.call(zoom);

    // 窗口大小变化时更新SVG尺寸
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      svg.attr('width', newWidth).attr('height', newHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 绘制树形结构（当root或currentStep变化时更新）
  useEffect(() => {
    if (!gRef.current || !root || !containerRef.current) return;

    const g = gRef.current;
    
    // 获取容器的实际尺寸
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    
    // 重新计算树的布局，确保居中
    // 需要减去底部步骤信息区域的高度（约100px）
    const availableHeight = containerHeight - 120;
    calculateTreeLayout(root, containerWidth, availableHeight);
    
    // 清除旧的树形内容，但保留组本身
    g.selectAll('*').remove();

    // 获取所有节点和边
    const allNodes = getAllNodes(root);
    const realNodes = getRealNodes(root);
    const nullNodes = getNullNodes(root);
    const edges = getAllEdges(root);
    const nodesMap = new Map(allNodes.map(n => [n.id, n]));

    // 当前步骤的高亮状态
    const highlightedNodes = new Set(currentStep?.highlightedNodes || []);
    const highlightedEdges = new Set(
      (currentStep?.highlightedEdges || []).map(([a, b]) => `${a}-${b}`)
    );
    const currentNodeId = currentStep?.currentNodeId;
    const animationType = currentStep?.animationType || 'none';
    const animationData = currentStep?.animationData;
    
    // ========== 绘制边 ==========
    // 先绘制连接到空节点的边（虚线）
    g.selectAll('.edge-null')
      .data(edges.filter(e => e[2])) // 只选择连接到空节点的边
      .enter()
      .append('line')
      .attr('class', 'edge edge-null')
      .attr('x1', d => d[0].x)
      .attr('y1', d => d[0].y)
      .attr('x2', d => d[1].x)
      .attr('y2', d => d[1].y)
      .attr('stroke', 'rgba(255, 255, 255, 0.2)')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4,4'); // 虚线样式

    // 绘制连接到实际节点的边（实线）
    g.selectAll('.edge-real')
      .data(edges.filter(e => !e[2])) // 只选择连接到实际节点的边
      .enter()
      .append('line')
      .attr('class', 'edge edge-real')
      .attr('x1', d => d[0].x)
      .attr('y1', d => d[0].y)
      .attr('x2', d => d[1].x)
      .attr('y2', d => d[1].y)
      .attr('stroke', d => {
        const edgeKey = `${d[0].id}-${d[1].id}`;
        if (highlightedEdges.has(edgeKey)) return getAnimationColor(animationType);
        return 'rgba(255, 255, 255, 0.3)';
      })
      .attr('stroke-width', d => {
        const edgeKey = `${d[0].id}-${d[1].id}`;
        if (highlightedEdges.has(edgeKey)) return 3;
        return 2;
      });

    // ========== 绘制空节点（NULL节点） ==========
    const nullNodeGroups = g.selectAll('.node-null')
      .data(nullNodes)
      .enter()
      .append('g')
      .attr('class', 'node node-null')
      .attr('transform', d => `translate(${d.x}, ${d.y})`);

    // 空节点圆圈（虚线边框）
    nullNodeGroups.append('circle')
      .attr('r', 18)
      .attr('fill', 'rgba(100, 100, 100, 0.1)')
      .attr('stroke', 'rgba(255, 255, 255, 0.25)')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3,3'); // 虚线边框

    // 空节点文字 "NULL"
    nullNodeGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', 'rgba(255, 255, 255, 0.4)')
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .text('NULL');

    // ========== 绘制实际节点 ==========
    const nodeGroups = g.selectAll('.node-real')
      .data(realNodes)
      .enter()
      .append('g')
      .attr('class', 'node node-real')
      .attr('transform', d => `translate(${d.x}, ${d.y})`);

    // 节点圆圈
    nodeGroups.append('circle')
      .attr('r', 22)
      .attr('fill', d => {
        if (d.id === currentNodeId) {
          return getAnimationColor(animationType);
        }
        if (highlightedNodes.has(d.id)) return 'rgba(255, 161, 22, 0.3)';
        return 'rgba(255, 255, 255, 0.1)';
      })
      .attr('stroke', d => {
        if (d.id === currentNodeId) return '#fff';
        if (highlightedNodes.has(d.id)) return '#ffa116';
        return 'rgba(255, 255, 255, 0.4)';
      })
      .attr('stroke-width', d => d.id === currentNodeId ? 3 : 2);

    // 节点值
    nodeGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', d => d.id === currentNodeId ? '#1a1a2e' : '#e0e0e0')
      .attr('font-size', '14px')
      .attr('font-weight', '600')
      .text(d => d.val !== null ? d.val : '');

    // 显示深度信息
    if (currentStep?.leftDepth !== undefined || currentStep?.rightDepth !== undefined) {
      const currentNode = realNodes.find(n => n.id === currentNodeId);
      if (currentNode) {
        // 获取左子节点（可能是空节点）
        if (currentStep.leftDepth !== undefined && currentNode.left) {
          const leftChild = currentNode.left;
          g.append('text')
            .attr('x', (currentNode.x + leftChild.x) / 2 - 15)
            .attr('y', (currentNode.y + leftChild.y) / 2)
            .attr('fill', '#4ecdc4')
            .attr('font-size', '12px')
            .attr('font-weight', '600')
            .text(`L:${currentStep.leftDepth}`);
        }
        // 获取右子节点（可能是空节点）
        if (currentStep.rightDepth !== undefined && currentNode.right) {
          const rightChild = currentNode.right;
          g.append('text')
            .attr('x', (currentNode.x + rightChild.x) / 2 + 5)
            .attr('y', (currentNode.y + rightChild.y) / 2)
            .attr('fill', '#ff6b6b')
            .attr('font-size', '12px')
            .attr('font-weight', '600')
            .text(`R:${currentStep.rightDepth}`);
        }
      }
    }

    // 绘制动画效果
    if (animationType !== 'none' && animationData) {
      const animColor = getAnimationColor(animationType);

      // 返回值传递动画 - 绘制带箭头的路径和状态标签
      if ((animationType === 'return-value' || animationType === 'param-pass') && 
          animationData.fromNodeId && animationData.toNodeId) {
        const fromNode = nodesMap.get(animationData.fromNodeId);
        const toNode = nodesMap.get(animationData.toNodeId);
        
        if (fromNode && toNode) {
          const isUpward = animationType === 'return-value';
          const startNode = isUpward ? fromNode : toNode;
          const endNode = isUpward ? toNode : fromNode;
          
          // 计算路径偏移，避免与边重叠
          const dx = endNode.x - startNode.x;
          const dy = endNode.y - startNode.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const offsetX = -dy / len * 15;
          const offsetY = dx / len * 15;

          // 绘制动画路径
          const path = g.append('path')
            .attr('d', `M${startNode.x + offsetX},${startNode.y + offsetY} L${endNode.x + offsetX},${endNode.y + offsetY}`)
            .attr('stroke', animColor)
            .attr('stroke-width', 2)
            .attr('fill', 'none')
            .attr('stroke-dasharray', '5,5')
            .attr('marker-end', `url(#arrow-${isUpward ? 2 : 3})`);

          // 路径动画
          const totalLength = path.node()?.getTotalLength() || 0;
          path
            .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
            .attr('stroke-dashoffset', totalLength)
            .transition()
            .duration(500)
            .attr('stroke-dashoffset', 0);

          // 显示传递的值标签
          const midX = (startNode.x + endNode.x) / 2 + offsetX;
          const midY = (startNode.y + endNode.y) / 2 + offsetY;
          
          // 值传递标签背景
          const valueText = String(animationData.value);
          const labelWidth = Math.max(50, valueText.length * 8 + 16);
          
          g.append('rect')
            .attr('class', 'value-label-bg')
            .attr('x', midX - labelWidth / 2)
            .attr('y', midY - 12)
            .attr('width', labelWidth)
            .attr('height', 24)
            .attr('rx', 4)
            .attr('fill', animColor)
            .attr('opacity', 0.95);

          g.append('text')
            .attr('class', 'value-label')
            .attr('x', midX)
            .attr('y', midY + 4)
            .attr('text-anchor', 'middle')
            .attr('fill', '#1a1a2e')
            .attr('font-size', '11px')
            .attr('font-weight', '600')
            .text(valueText);

          // 在目标节点上方添加状态标签
          const targetNode = isUpward ? toNode : fromNode;
          const stateText = isUpward ? '返回值' : '参数传递';
          const stateLabelWidth = 60;
          
          g.append('rect')
            .attr('class', 'state-label-bg')
            .attr('x', targetNode.x - stateLabelWidth / 2)
            .attr('y', targetNode.y - 55)
            .attr('width', stateLabelWidth)
            .attr('height', 20)
            .attr('rx', 4)
            .attr('fill', animColor)
            .attr('opacity', 0.9);

          g.append('text')
            .attr('class', 'state-label')
            .attr('x', targetNode.x)
            .attr('y', targetNode.y - 41)
            .attr('text-anchor', 'middle')
            .attr('fill', '#1a1a2e')
            .attr('font-size', '11px')
            .attr('font-weight', '600')
            .text(stateText);
        }
      }

      // 比较动画 - 显示比较结果和状态标签
      if (animationType === 'compare' && animationData.compareResult) {
        const currentNode = realNodes.find(n => n.id === currentNodeId);
        if (currentNode) {
          // 比较标签背景
          g.append('rect')
            .attr('class', 'compare-label-bg')
            .attr('x', currentNode.x - 55)
            .attr('y', currentNode.y - 75)
            .attr('width', 110)
            .attr('height', 45)
            .attr('rx', 6)
            .attr('fill', animColor)
            .attr('opacity', 0.95);

          // 状态标题
          g.append('text')
            .attr('class', 'compare-title')
            .attr('x', currentNode.x)
            .attr('y', currentNode.y - 58)
            .attr('text-anchor', 'middle')
            .attr('fill', '#1a1a2e')
            .attr('font-size', '10px')
            .attr('font-weight', '500')
            .text('比较大小');

          // 比较内容
          g.append('text')
            .attr('class', 'compare-content')
            .attr('x', currentNode.x)
            .attr('y', currentNode.y - 42)
            .attr('text-anchor', 'middle')
            .attr('fill', '#1a1a2e')
            .attr('font-size', '13px')
            .attr('font-weight', '700')
            .text(`${animationData.compareLeft} vs ${animationData.compareRight}`);

          // 比较结果
          g.append('text')
            .attr('class', 'compare-result')
            .attr('x', currentNode.x)
            .attr('y', currentNode.y - 28)
            .attr('text-anchor', 'middle')
            .attr('fill', '#1a1a2e')
            .attr('font-size', '10px')
            .attr('font-weight', '500')
            .text(`结果: ${animationData.compareResult}`);
        }
      }

      // 递归进入/退出动画 - 添加指示器和状态标签
      if (animationType === 'recursion-enter' || animationType === 'recursion-exit') {
        const currentNode = realNodes.find(n => n.id === currentNodeId);
        if (currentNode) {
          const isEnter = animationType === 'recursion-enter';
          
          // 添加动画圆环
          g.append('circle')
            .attr('cx', currentNode.x)
            .attr('cy', currentNode.y)
            .attr('r', 22)
            .attr('fill', 'none')
            .attr('stroke', animColor)
            .attr('stroke-width', 3)
            .attr('opacity', 1)
            .transition()
            .duration(600)
            .attr('r', 35)
            .attr('opacity', 0);

          // 添加状态标签背景
          const labelText = isEnter ? '递归进入' : '递归退出';
          const labelWidth = 70;
          
          g.append('rect')
            .attr('class', 'state-label-bg')
            .attr('x', currentNode.x - labelWidth / 2)
            .attr('y', currentNode.y - 55)
            .attr('width', labelWidth)
            .attr('height', 22)
            .attr('rx', 4)
            .attr('fill', animColor)
            .attr('opacity', 0.95);

          // 添加状态标签文字
          g.append('text')
            .attr('class', 'state-label')
            .attr('x', currentNode.x)
            .attr('y', currentNode.y - 40)
            .attr('text-anchor', 'middle')
            .attr('fill', '#1a1a2e')
            .attr('font-size', '12px')
            .attr('font-weight', '600')
            .text(labelText);

          // 添加方向箭头
          g.append('text')
            .attr('x', currentNode.x)
            .attr('y', currentNode.y - 62)
            .attr('text-anchor', 'middle')
            .attr('fill', animColor)
            .attr('font-size', '14px')
            .text(isEnter ? '↓' : '↑');
        }
      }

      // 更新直径动画 - 显示直径计算过程
      if (animationType === 'update-diameter') {
        const currentNode = realNodes.find(n => n.id === currentNodeId);
        if (currentNode) {
          // 直径更新标签背景
          g.append('rect')
            .attr('class', 'diameter-label-bg')
            .attr('x', currentNode.x - 55)
            .attr('y', currentNode.y - 70)
            .attr('width', 110)
            .attr('height', 40)
            .attr('rx', 6)
            .attr('fill', animColor)
            .attr('opacity', 0.95);

          // 状态标题
          g.append('text')
            .attr('class', 'diameter-title')
            .attr('x', currentNode.x)
            .attr('y', currentNode.y - 53)
            .attr('text-anchor', 'middle')
            .attr('fill', '#1a1a2e')
            .attr('font-size', '10px')
            .attr('font-weight', '500')
            .text('更新直径');

          // 直径值
          g.append('text')
            .attr('class', 'diameter-value')
            .attr('x', currentNode.x)
            .attr('y', currentNode.y - 36)
            .attr('text-anchor', 'middle')
            .attr('fill', '#1a1a2e')
            .attr('font-size', '16px')
            .attr('font-weight', '700')
            .text(`${animationData.value}`);

          // 添加闪烁动画效果
          g.append('circle')
            .attr('cx', currentNode.x)
            .attr('cy', currentNode.y)
            .attr('r', 22)
            .attr('fill', 'none')
            .attr('stroke', animColor)
            .attr('stroke-width', 4)
            .attr('opacity', 1)
            .transition()
            .duration(400)
            .attr('r', 40)
            .attr('opacity', 0);
        }
      }
    }

  }, [root, currentStep]);

  return (
    <div className="tree-visualization" ref={containerRef}>
      {root ? (
        <>
          <svg ref={svgRef}></svg>
          {/* 缩放控制按钮 */}
          <div className="zoom-controls">
            <button 
              className="zoom-btn" 
              onClick={handleZoomIn}
              title="放大"
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
              </svg>
            </button>
            <span className="zoom-level">{Math.round(zoomScale * 100)}%</span>
            <button 
              className="zoom-btn" 
              onClick={handleZoomOut}
              title="缩小"
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="currentColor" d="M19,13H5V11H19V13Z" />
              </svg>
            </button>
            <button 
              className="zoom-btn reset-btn" 
              onClick={handleResetView}
              title="重置视图"
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="currentColor" d="M12,5V1L7,6L12,11V7A6,6 0 0,1 18,13A6,6 0 0,1 12,19A6,6 0 0,1 6,13H4A8,8 0 0,0 12,21A8,8 0 0,0 20,13A8,8 0 0,0 12,5Z" />
              </svg>
            </button>
          </div>
          {/* 拖拽提示 */}
          <div className="drag-hint">
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path fill="currentColor" d="M13,6V11H18V7.75L22.25,12L18,16.25V13H13V18H16.25L12,22.25L7.75,18H11V13H6V16.25L1.75,12L6,7.75V11H11V6H7.75L12,1.75L16.25,6H13Z" />
            </svg>
            <span>拖拽移动 · 滚轮缩放</span>
          </div>
        </>
      ) : (
        <div className="empty-tree">请输入有效的二叉树数据</div>
      )}
      {currentStep && (
        <div className="step-info">
          <div className="step-number">
            步骤 {currentStep.stepIndex + 1}
            {currentStep.animationType && currentStep.animationType !== 'none' && (
              <span className={`animation-indicator ${currentStep.animationType}`}>
                {currentStep.animationType === 'recursion-enter' && '📥 递归进入'}
                {currentStep.animationType === 'recursion-exit' && '📤 递归退出'}
                {currentStep.animationType === 'return-value' && '⬆️ 返回值'}
                {currentStep.animationType === 'compare' && '🔄 比较'}
                {currentStep.animationType === 'update-diameter' && '✅ 更新直径'}
                {currentStep.animationType === 'param-pass' && '⬇️ 参数传递'}
              </span>
            )}
          </div>
          <div className="step-description">{currentStep.description}</div>
          <div className="diameter-display">
            当前直径: <span className="diameter-value">{currentStep.currentDiameter}</span>
          </div>
        </div>
      )}
    </div>
  );
}
