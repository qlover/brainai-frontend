import { GenUtil } from 'js-cutil/dist/base/cutil/GenUtil';
import {
  StoreInterface,
  StoreStateInterface
} from '@/base/port/StoreInterface';
import {
  applyNodeChanges,
  EdgeChange,
  Edge,
  Node,
  OnNodesChange,
  OnEdgesChange,
  NodeChange,
  applyEdgeChanges
} from '@xyflow/react';

export interface XYFlowNodeData {
  label?: string;
  apiDetails?: string;
  variables?: string;
  design?: string;
  components?: string[];

  [key: string]: unknown;
}
export interface XYFlowNode extends Node {
  data: XYFlowNodeData;
}
export interface XYFlowEdge extends Edge {
  data: Record<string, unknown>;
}

export class XYFlowStoreState implements StoreStateInterface {
  nodes: XYFlowNode[] = [];
  edges: XYFlowEdge[] = [];
  currentEdgeId: string = '';

  copyWith(state: {
    nodes?: XYFlowNode[];
    edges?: XYFlowEdge[];
    currentEdgeId?: string;
  }): XYFlowStoreState {
    return GenUtil.copyWith(new XYFlowStoreState(), this, state);
  }
}

/**
 * A store for the XYFlow Component.
 */
export class XYFlowStore extends StoreInterface<XYFlowStoreState> {
  constructor() {
    super(() => new XYFlowStoreState());
  }

  changeNodes(nodes: XYFlowNode[]): void {
    this.emit(this.state.copyWith({ nodes }));
  }

  changeEdges(edges: XYFlowEdge[]): void {
    this.emit(this.state.copyWith({ edges }));
  }

  changeCurrentEdgeId(edgeId: string): void {
    this.emit(this.state.copyWith({ currentEdgeId: edgeId }));
  }

  onNodesChange: OnNodesChange<XYFlowNode> = (
    changes: NodeChange<XYFlowNode>[]
  ) => {
    this.emit(
      this.state.copyWith({
        nodes: applyNodeChanges(changes, this.state.nodes)
      })
    );
  };

  onEdgesChange: OnEdgesChange<XYFlowEdge> = (
    changes: EdgeChange<XYFlowEdge>[]
  ) => {
    this.emit(
      this.state.copyWith({
        edges: applyEdgeChanges(changes, this.state.edges)
      })
    );
  };
}
