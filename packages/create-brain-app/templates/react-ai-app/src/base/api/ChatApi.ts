import { HttpClient } from './HttpClient';
import { XYFlowEdge, XYFlowNode, XYFlowNodeData } from '../store/XYFlowStore';

export interface HistoryType {
  nodes: XYFlowNode[];
  edges: XYFlowEdge[];
}
export class ChatApi {
  constructor(private httpClient: HttpClient) {}

  getListDesigns(): Promise<unknown> {
    return this.httpClient.get('/list-designs');
  }

  saveDesign(data: {
    designId: string;
    designThinking?: XYFlowNodeData;
    graphData: { nodes: XYFlowNode[]; edges: XYFlowEdge[] };
    history: unknown[];
  }): Promise<unknown> {
    return this.httpClient.post('/save-design', data);
  }

  getDesign(designId: string): Promise<{
    currentGraph: { nodes: XYFlowNode[]; edges: XYFlowEdge[] };
    history: HistoryType[];
  }> {
    return this.httpClient.get(
      // TODO: replace url
      `http://localhost:3001/api/load-design/${designId}`
    );
  }

  processCommand(data: { command: string; model: string }): Promise<{
    nodes: XYFlowNode[];
    edges: XYFlowEdge[];
  }> {
    return this.httpClient.post('/process-command', data);
  }

  updateGraph(data: {
    command: string;
    model: string;
    currentGraph: { nodes: XYFlowNode[]; edges: XYFlowEdge[] };
  }): Promise<{
    nodes: XYFlowNode[];
    edges: XYFlowEdge[];
  }> {
    return this.httpClient.post('/update-graph', data);
  }
}
