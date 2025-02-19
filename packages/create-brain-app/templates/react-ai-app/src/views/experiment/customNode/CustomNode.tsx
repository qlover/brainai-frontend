import { CSSProperties, memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { XYFlowNode } from '@/base/store/XYFlowStore';

const CustomNodeInner = ({ data }: XYFlowNode) => {
  const style: CSSProperties = {
    padding: '10px',
    position: 'relative',
    zIndex: 1,
    opacity: 1,
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    width: 'auto',
    height: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <div style={style}>
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: '#555',
          width: 8,
          height: 8,
          opacity: 0.8,
          zIndex: 2
        }}
        isConnectable={true}
      />
      <div
        style={{
          fontWeight: 'bold',
          fontSize: '14px',
          opacity: 1,
          overflow: 'hidden',
          height: 'auto'
        }}
      >
        {data.label}
      </div>
      <div
        style={{
          fontSize: '12px',
          opacity: 1
        }}
      >
        {data.components && (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {data.components.map((component, index) => (
              <li key={index} style={{ marginBottom: '4px' }}>
                • {component}
              </li>
            ))}
          </ul>
        )}
        {data.apiDetails && (
          <div
            style={{
              marginTop: '8px',
              padding: '8px',
              background: 'rgba(75, 0, 130, 0.1)',
              borderRadius: '4px'
            }}
          >
            <div
              style={{
                fontWeight: 'bold',
                color: '#4B0082',
                marginBottom: '4px'
              }}
            >
              API Details:
            </div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{data.apiDetails}</div>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: '#555',
          width: 8,
          height: 8,
          opacity: 0.8,
          zIndex: 2
        }}
        isConnectable={true}
      />
    </div>
  );
};

export const CustomNode = memo(CustomNodeInner);
