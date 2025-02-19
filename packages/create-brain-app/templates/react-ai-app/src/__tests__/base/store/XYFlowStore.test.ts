import { describe, it, expect, beforeEach, vi } from 'vitest';
import { XYFlowStore, XYFlowNode, XYFlowEdge } from '@/base/store/XYFlowStore';

describe('XYFlowStore', () => {
  let store: XYFlowStore;

  beforeEach(() => {
    store = new XYFlowStore();
  });

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      expect(store.state.nodes).toEqual([]);
      expect(store.state.edges).toEqual([]);
      expect(store.state.currentEdgeId).toBe('');
    });
  });

  describe('节点操作', () => {
    it('changeNodes 应该正确更新节点', () => {
      const newNodes: XYFlowNode[] = [
        {
          id: '1',
          type: 'custom',
          position: { x: 0, y: 0 },
          data: { label: 'Node 1' }
        }
      ];

      store.changeNodes(newNodes);
      expect(store.state.nodes).toEqual(newNodes);
    });

    it('onNodesChange 应该正确处理节点变更', () => {
      const initialNodes: XYFlowNode[] = [
        {
          id: '1',
          type: 'custom',
          position: { x: 0, y: 0 },
          data: { label: 'Node 1' }
        }
      ];

      store.changeNodes(initialNodes);

      const changes = [
        {
          type: 'position' as const,
          id: '1',
          position: { x: 100, y: 100 }
        }
      ];

      store.onNodesChange(changes);

      expect(store.state.nodes[0].position).toEqual({ x: 100, y: 100 });
    });
  });

  describe('边操作', () => {
    it('changeEdges 应该正确更新边', () => {
      const newEdges: XYFlowEdge[] = [
        {
          id: 'e1',
          source: '1',
          target: '2',
          data: {}
        }
      ];

      store.changeEdges(newEdges);
      expect(store.state.edges).toEqual(newEdges);
    });

    it('onEdgesChange 应该正确处理边变更', () => {
      const initialEdges: XYFlowEdge[] = [
        {
          id: 'e1',
          source: '1',
          target: '2',
          data: {}
        }
      ];

      store.changeEdges(initialEdges);

      const changes = [
        {
          type: 'remove' as const,
          id: 'e1'
        }
      ];

      store.onEdgesChange(changes);
      expect(store.state.edges).toEqual([]);
    });

    it('changeCurrentEdgeId 应该正确更新当前边ID', () => {
      const edgeId = 'e1';
      store.changeCurrentEdgeId(edgeId);
      expect(store.state.currentEdgeId).toBe(edgeId);
    });
  });

  describe('状态订阅', () => {
    it('应该正确触发状态更新', () => {
      const listener = vi.fn();
      const unsubscribe = store.observe(listener);

      store.changeNodes([
        {
          id: '1',
          type: 'custom',
          position: { x: 0, y: 0 },
          data: { label: 'Node 1' }
        }
      ]);
      expect(listener).toHaveBeenCalledTimes(1);

      store.changeEdges([
        {
          id: 'e1',
          source: '1',
          target: '2',
          data: {}
        }
      ]);
      expect(listener).toHaveBeenCalledTimes(2);

      unsubscribe();
      store.changeCurrentEdgeId('e1');
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it('应该支持选择器订阅', () => {
      const nodesListener = vi.fn();
      const unsubscribe = store.observe((state) => state.nodes, nodesListener);

      // 节点变化时应该触发
      store.changeNodes([
        {
          id: '1',
          type: 'custom',
          position: { x: 0, y: 0 },
          data: { label: 'Node 1' }
        }
      ]);
      expect(nodesListener).toHaveBeenCalledTimes(1);

      // 边变化时不应该触发
      store.changeEdges([
        {
          id: 'e1',
          source: '1',
          target: '2',
          data: {}
        }
      ]);
      expect(nodesListener).toHaveBeenCalledTimes(1);

      unsubscribe();
    });
  });

  describe('XYFlowStore 方法测试', () => {
    let store: XYFlowStore;

    beforeEach(() => {
      store = new XYFlowStore();
    });

    describe('changeNodes', () => {
      it('应该能添加新节点', () => {
        const newNodes: XYFlowNode[] = [
          {
            id: '1',
            type: 'custom',
            position: { x: 0, y: 0 },
            data: { label: 'Node 1' }
          }
        ];
        store.changeNodes(newNodes);
        expect(store.state.nodes).toHaveLength(1);
        expect(store.state.nodes[0]).toEqual(newNodes[0]);
      });

      it('应该能更新现有节点', () => {
        const initialNodes: XYFlowNode[] = [
          {
            id: '1',
            type: 'custom',
            position: { x: 0, y: 0 },
            data: { label: 'Node 1' }
          }
        ];
        store.changeNodes(initialNodes);

        const updatedNodes: XYFlowNode[] = [
          {
            id: '1',
            type: 'custom',
            position: { x: 100, y: 100 },
            data: { label: 'Updated Node 1' }
          }
        ];
        store.changeNodes(updatedNodes);

        expect(store.state.nodes).toHaveLength(1);
        expect(store.state.nodes[0]).toEqual(updatedNodes[0]);
      });

      it('应该能清空节点', () => {
        const initialNodes: XYFlowNode[] = [
          {
            id: '1',
            type: 'custom',
            position: { x: 0, y: 0 },
            data: { label: 'Node 1' }
          }
        ];
        store.changeNodes(initialNodes);
        store.changeNodes([]);
        expect(store.state.nodes).toHaveLength(0);
      });
    });

    describe('changeEdges', () => {
      it('应该能添加新边', () => {
        const newEdges: XYFlowEdge[] = [
          {
            id: 'e1',
            source: '1',
            target: '2',
            data: {}
          }
        ];
        store.changeEdges(newEdges);
        expect(store.state.edges).toHaveLength(1);
        expect(store.state.edges[0]).toEqual(newEdges[0]);
      });

      it('应该能更新现有边', () => {
        const initialEdges: XYFlowEdge[] = [
          {
            id: 'e1',
            source: '1',
            target: '2',
            data: {}
          }
        ];
        store.changeEdges(initialEdges);

        const updatedEdges: XYFlowEdge[] = [
          {
            id: 'e1',
            source: '1',
            target: '3', // 更新目标节点
            data: { label: 'Updated Edge' }
          }
        ];
        store.changeEdges(updatedEdges);

        expect(store.state.edges).toHaveLength(1);
        expect(store.state.edges[0]).toEqual(updatedEdges[0]);
      });

      it('应该能清空边', () => {
        const initialEdges: XYFlowEdge[] = [
          {
            id: 'e1',
            source: '1',
            target: '2',
            data: {}
          }
        ];
        store.changeEdges(initialEdges);
        store.changeEdges([]);
        expect(store.state.edges).toHaveLength(0);
      });
    });

    describe('onNodesChange', () => {
      it('应该能处理节点位置变更', () => {
        const initialNodes: XYFlowNode[] = [
          {
            id: '1',
            type: 'custom',
            position: { x: 0, y: 0 },
            data: { label: 'Node 1' }
          }
        ];
        store.changeNodes(initialNodes);

        store.onNodesChange([
          {
            type: 'position',
            id: '1',
            position: { x: 100, y: 100 }
          }
        ]);

        expect(store.state.nodes[0].position).toEqual({ x: 100, y: 100 });
      });

      it('应该能处理节点删除', () => {
        const initialNodes: XYFlowNode[] = [
          {
            id: '1',
            type: 'custom',
            position: { x: 0, y: 0 },
            data: { label: 'Node 1' }
          }
        ];
        store.changeNodes(initialNodes);

        store.onNodesChange([
          {
            type: 'remove',
            id: '1'
          }
        ]);

        expect(store.state.nodes).toHaveLength(0);
      });

      it('应该能处理节点选择状态变更', () => {
        const initialNodes: XYFlowNode[] = [
          {
            id: '1',
            type: 'custom',
            position: { x: 0, y: 0 },
            data: { label: 'Node 1' },
            selected: false
          }
        ];
        store.changeNodes(initialNodes);

        store.onNodesChange([
          {
            type: 'select',
            id: '1',
            selected: true
          }
        ]);

        expect(store.state.nodes[0].selected).toBe(true);
      });
    });

    describe('onEdgesChange', () => {
      it('应该能处理边的删除', () => {
        const initialEdges: XYFlowEdge[] = [
          {
            id: 'e1',
            source: '1',
            target: '2',
            data: {}
          }
        ];
        store.changeEdges(initialEdges);

        store.onEdgesChange([
          {
            type: 'remove',
            id: 'e1'
          }
        ]);

        expect(store.state.edges).toHaveLength(0);
      });

      it('应该能处理边的选择状态变更', () => {
        const initialEdges: XYFlowEdge[] = [
          {
            id: 'e1',
            source: '1',
            target: '2',
            data: {},
            selected: false
          }
        ];
        store.changeEdges(initialEdges);

        store.onEdgesChange([
          {
            type: 'select',
            id: 'e1',
            selected: true
          }
        ]);

        expect(store.state.edges[0].selected).toBe(true);
      });
    });

    describe('changeCurrentEdgeId', () => {
      it('应该能设置当前边ID', () => {
        store.changeCurrentEdgeId('e1');
        expect(store.state.currentEdgeId).toBe('e1');
      });

      it('应该能更新当前边ID', () => {
        store.changeCurrentEdgeId('e1');
        store.changeCurrentEdgeId('e2');
        expect(store.state.currentEdgeId).toBe('e2');
      });

      it('应该能清空当前边ID', () => {
        store.changeCurrentEdgeId('e1');
        store.changeCurrentEdgeId('');
        expect(store.state.currentEdgeId).toBe('');
      });
    });

    describe('resetState', () => {
      it('应该能重置所有状态到初始值', () => {
        // 设置一些初始数据
        const initialNodes: XYFlowNode[] = [
          {
            id: '1',
            type: 'custom',
            position: { x: 0, y: 0 },
            data: { label: 'Node 1' }
          }
        ];
        const initialEdges: XYFlowEdge[] = [
          {
            id: 'e1',
            source: '1',
            target: '2',
            data: {}
          }
        ];

        store.changeNodes(initialNodes);
        store.changeEdges(initialEdges);
        store.changeCurrentEdgeId('e1');

        // 验证数据已经设置
        expect(store.state.nodes).toHaveLength(1);
        expect(store.state.edges).toHaveLength(1);
        expect(store.state.currentEdgeId).toBe('e1');

        // 重置状态
        store.resetState();

        // 验证所有状态都恢复到初始值
        expect(store.state.nodes).toEqual([]);
        expect(store.state.edges).toEqual([]);
        expect(store.state.currentEdgeId).toBe('');
      });

      it('重置后应该能重新添加数据', () => {
        // 先添加一些数据并重置
        store.changeNodes([
          {
            id: '1',
            type: 'custom',
            position: { x: 0, y: 0 },
            data: { label: 'Node 1' }
          }
        ]);
        store.resetState();

        // 重置后添加新数据
        const newNodes: XYFlowNode[] = [
          {
            id: '2',
            type: 'custom',
            position: { x: 100, y: 100 },
            data: { label: 'Node 2' }
          }
        ];
        store.changeNodes(newNodes);

        // 验证新数据是否正确设置
        expect(store.state.nodes).toHaveLength(1);
        expect(store.state.nodes[0]).toEqual(newNodes[0]);
      });

      it('重置应该触发状态更新', () => {
        const listener = vi.fn();
        const unsubscribe = store.observe(listener);

        store.resetState();

        expect(listener).toHaveBeenCalledTimes(1);
        unsubscribe();
      });
    });
  });
});
