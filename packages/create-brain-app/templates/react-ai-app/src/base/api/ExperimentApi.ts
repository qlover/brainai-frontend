import { HttpClient } from './HttpClient';
import { XYFlowEdge, XYFlowNode } from '@/base/store/XYFlowStore';
import { settings } from '@/base/kernel/Settings';

export type Metadata = {
  name: string;
  nodes?: string;
  edges?: string;
  hasPreviewUrl?: boolean;
  hasPublishUrl?: boolean;
  code?: string;
};

export class ProjectResponse {
  constructor(
    public id: string,
    public metadata: Metadata,
    public created: number,
    public updated: number,
    public version: number,
    public type: string,
    public properties: Record<string, unknown>
  ) {}

  static fromJson(json: {
    id: string;
    metadata: Metadata;
    created: number;
    updated: number;
    version: number;
    type: string;
    properties: Record<string, unknown>;
  }): ProjectResponse {
    return new ProjectResponse(
      json.id,
      json.metadata,
      json.created,
      json.updated,
      json.version,
      json.type,
      json.properties
    );
  }
}

export class ProjectSaveData {
  constructor(public metadata: Omit<Metadata, 'name'>) {}

  static create(nodes: XYFlowNode[], edges: XYFlowEdge[]): ProjectSaveData {
    return new ProjectSaveData({
      nodes: JSON.stringify(nodes),
      edges: JSON.stringify(edges)
    });
  }

  static parse(data: ProjectSaveData): {
    nodes: XYFlowNode[];
    edges: XYFlowEdge[];
  } {
    return {
      nodes: JSON.parse(data.metadata.nodes || '[]'),
      edges: JSON.parse(data.metadata.edges || '[]')
    };
  }
}

export class ExperimentApi {
  constructor(private httpClient: HttpClient) {}

  async getProject(id: string): Promise<ProjectResponse> {
    const response = await this.httpClient.post(
      `${settings.projectManageApiBaseUrl}/project/get?id=${id}`,
      undefined
    );
    return ProjectResponse.fromJson(response as ProjectResponse);
  }

  async updateProject(
    id: string,
    data: ProjectSaveData | Record<string, unknown>
  ): Promise<ProjectResponse> {
    const response = await this.httpClient.post(
      `${settings.projectManageApiBaseUrl}/project/update?id=${id}`,
      data
    );
    return ProjectResponse.fromJson(response as ProjectResponse);
  }
}
