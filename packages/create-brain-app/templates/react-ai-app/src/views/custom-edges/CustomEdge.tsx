import {
  EdgeProps,
  getSmoothStepPath,
  EdgeLabelRenderer,
  useInternalNode
} from '@xyflow/react';
import { getEdgeParams, getEdgeLabelPosition } from './util';

export interface ApiOption {
  api_name: string;
  api_description: string;
  api_params: string[];
  api_request_has_body: boolean;
}

export function CustomEdge(edgeProps: EdgeProps) {
  const { id, source, target, label, style } = edgeProps;

  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    sourceNode!,
    targetNode!
  );

  const [edgePath] = getSmoothStepPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
    borderRadius: 16,
    offset: 20
  });

  // 计算边标签的位置
  const { centerX, centerY } = getEdgeLabelPosition(sx, sy, tx, ty, edgePath);

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={style}
      />
      <EdgeLabelRenderer>
        <div
          className="edge-label"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${centerX}px,${centerY}px)`
          }}
        >
          {label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
