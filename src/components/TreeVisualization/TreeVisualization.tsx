import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { D3TreeNode, AlgorithmStep } from '../../types';
import { getAllNodes, getAllEdges } from '../../utils/treeUtils';
import './TreeVisualization.css';

interface TreeVisualizationProps {
  root: D3TreeNode | null;
  currentStep: AlgorithmStep | null;
}

export function TreeVisualization({ root, currentStep }: TreeVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !root) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    svg.attr('width', width).attr('height', height);

    const g = svg.append('g');

    const nodes = getAllNodes(root);
    const edges = getAllEdges(root);

    const highlightedNodes = new Set(currentStep?.highlightedNodes || []);
    const highlightedEdges = new Set(
      (currentStep?.highlightedEdges || []).map(([a, b]) => `${a}-${b}`)
    );
    const currentNodeId = currentStep?.currentNodeId;

    // 绘制边
    g.selectAll('.edge')
      .data(edges)
      .enter()
      .append('line')
      .attr('class', 'edge')
      .attr('x1', d => d[0].x)
      .attr('y1', d => d[0].y)
      .attr('x2', d => d[1].x)
      .attr('y2', d => d[1].y)
      .attr('stroke', d => {
        const edgeKey = `${d[0].id}-${d[1].id}`;
        if (highlightedEdges.has(edgeKey)) return '#ffa116';
        return 'rgba(255, 255, 255, 0.3)';
      })
      .attr('stroke-width', d => {
        const edgeKey = `${d[0].id}-${d[1].id}`;
        if (highlightedEdges.has(edgeKey)) return 3;
        return 2;
      });

    // 绘制节点
    const nodeGroups = g.selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x}, ${d.y})`);

    // 节点圆圈
    nodeGroups.append('circle')
      .attr('r', 22)
      .attr('fill', d => {
        if (d.id === currentNodeId) return '#ffa116';
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
      .text(d => d.val);

    // 显示深度信息
    if (currentStep?.leftDepth !== undefined || currentStep?.rightDepth !== undefined) {
      const currentNode = nodes.find(n => n.id === currentNodeId);
      if (currentNode) {
        if (currentStep.leftDepth !== undefined && currentNode.left) {
          g.append('text')
            .attr('x', (currentNode.x + currentNode.left.x) / 2 - 15)
            .attr('y', (currentNode.y + currentNode.left.y) / 2)
            .attr('fill', '#4ecdc4')
            .attr('font-size', '12px')
            .attr('font-weight', '600')
            .text(`L:${currentStep.leftDepth}`);
        }
        if (currentStep.rightDepth !== undefined && currentNode.right) {
          g.append('text')
            .attr('x', (currentNode.x + currentNode.right.x) / 2 + 5)
            .attr('y', (currentNode.y + currentNode.right.y) / 2)
            .attr('fill', '#ff6b6b')
            .attr('font-size', '12px')
            .attr('font-weight', '600')
            .text(`R:${currentStep.rightDepth}`);
        }
      }
    }

  }, [root, currentStep]);

  return (
    <div className="tree-visualization" ref={containerRef}>
      {root ? (
        <svg ref={svgRef}></svg>
      ) : (
        <div className="empty-tree">请输入有效的二叉树数据</div>
      )}
      {currentStep && (
        <div className="step-info">
          <div className="step-number">步骤 {currentStep.stepIndex + 1}</div>
          <div className="step-description">{currentStep.description}</div>
          <div className="diameter-display">
            当前直径: <span className="diameter-value">{currentStep.currentDiameter}</span>
          </div>
        </div>
      )}
    </div>
  );
}
