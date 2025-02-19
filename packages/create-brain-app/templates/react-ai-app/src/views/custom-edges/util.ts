import { InternalNode, Node, Position } from '@xyflow/react';

// this helper function returns the intersection point
// of the line between the center of the intersectionNode and the target node
function getNodeIntersection(
  intersectionNode: InternalNode,
  targetNode: InternalNode
) {
  // https://math.stackexchange.com/questions/1724792/an-algorithm-for-finding-the-intersection-point-between-a-center-of-vision-and-a
  const intersectionNodeWidth = intersectionNode.measured?.width || 0;
  const intersectionNodeHeight = intersectionNode.measured?.height || 0;

  const intersectionNodePosition = intersectionNode.internals.positionAbsolute;
  const targetPosition = targetNode.internals.positionAbsolute;

  const w = intersectionNodeWidth / 2;
  const h = intersectionNodeHeight / 2;

  const x2 = intersectionNodePosition.x + w;
  const y2 = intersectionNodePosition.y + h;
  const x1 = targetPosition.x + (targetNode.measured?.width || 0) / 2;
  const y1 = targetPosition.y + (targetNode.measured?.height || 0) / 2;

  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1));
  const xx3 = a * xx1;
  const yy3 = a * yy1;
  const x = w * (xx3 + yy3) + x2;
  const y = h * (-xx3 + yy3) + y2;

  return { x, y };
}

// returns the position (top,right,bottom or right) passed node compared to the intersection point
function getEdgePosition(
  node: Node,
  intersectionPoint: { x: number; y: number }
) {
  // @ts-expect-error
  const n = { ...node.internals.positionAbsolute, ...node };
  const nx = Math.round(n.x);
  const ny = Math.round(n.y);
  const px = Math.round(intersectionPoint.x);
  const py = Math.round(intersectionPoint.y);

  if (px <= nx + 1) {
    return Position.Left;
  }
  if (px >= nx + n.measured.width - 1) {
    return Position.Right;
  }
  if (py <= ny + 1) {
    return Position.Top;
  }
  if (py >= n.y + n.measured.height - 1) {
    return Position.Bottom;
  }

  return Position.Top;
}

// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
export function getEdgeParams(source: InternalNode, target: InternalNode) {
  const sourceIntersectionPoint = getNodeIntersection(source, target);
  const targetIntersectionPoint = getNodeIntersection(target, source);

  const sourcePos = getEdgePosition(source, sourceIntersectionPoint);
  const targetPos = getEdgePosition(target, targetIntersectionPoint);

  return {
    sx: sourceIntersectionPoint.x,
    sy: sourceIntersectionPoint.y,
    tx: targetIntersectionPoint.x,
    ty: targetIntersectionPoint.y,
    sourcePos,
    targetPos
  };
}

// 计算边的中心点位置
// 根据拐角数量和边的方向来确定标签的最佳位置
export function getEdgeLabelPosition(
  sx: number,
  sy: number,
  tx: number,
  ty: number,
  edgePath: string
) {
  const cornerCount = (edgePath.match(/Q/g) || []).length;
  const hasSingleCorner = cornerCount === 1;

  let centerX = (sx + tx) / 2;
  let centerY = (sy + ty) / 2;

  if (hasSingleCorner) {
    // 只提取 x 坐标，因为我们只需要判断水平移动
    const pathMatch = edgePath.match(/M(-?\d+\.?\d*).*?L(-?\d+\.?\d*)/);

    if (pathMatch) {
      const [
        ,
        startX, // M 命令的 x 坐标
        firstX // 第一个 L 命令的 x 坐标
      ] = pathMatch.map(Number);

      // 通过比较第一个 L 点和起点的 x 坐标来判断初始移动方向
      const isHorizontalFirst = startX !== firstX;

      if (isHorizontalFirst) {
        // 如果是先水平移动
        centerX = tx;
        centerY = sy;
      } else {
        // 如果是先垂直移动
        centerX = sx;
        centerY = ty;
      }
    }
  } else {
    // 多拐角情况:标签位置在路径中间,添加偏移以避免遮挡
    const offset = 20;

    if (Math.abs(sx - tx) > offset * 2) {
      const direction = sx < tx ? 1 : -1;
      const midX = Math.min(sx, tx) + Math.abs(sx - tx) / 2;
      const adjustedX = midX + direction * offset;
      centerX = adjustedX;
    }

    if (Math.abs(sy - ty) > offset * 2) {
      const direction = sy < ty ? 1 : -1;
      const midY = Math.min(sy, ty) + Math.abs(sy - ty) / 2;
      const adjustedY = midY + direction * offset;
      centerY = adjustedY;
    }
  }

  return { centerX, centerY };
}
