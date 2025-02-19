import { ProjectApi, UpdateFileRequest } from '@/base/api/ProjectApi';
import { ProjectStore } from '@/base/store/ProjectStore';
import {
  ExperimentApi,
  Metadata,
  ProjectResponse,
  ProjectSaveData
} from '../api/ExperimentApi';
import { XYFlowStore } from '../store/XYFlowStore';
import { SaveEventsInterface } from '../port/SaveEventsInterface';
import { SaveStore } from '../store/SaveStore';

export type SaveParams = {
  projectId?: string;
  events?: SaveEventsInterface;

  message?: string;
};

export class SaveProjectService {
  constructor(
    private readonly projectApi: ProjectApi,
    private readonly projectStore: ProjectStore,
    private readonly experimentApi: ExperimentApi,
    private readonly saveStore: SaveStore,
    private readonly saveEvents: SaveEventsInterface,
    private readonly xyFlowStore: XYFlowStore
  ) {}

  async updateFile(projectId: string): Promise<void> {
    const updateFileRequest: UpdateFileRequest = {
      filePath: 'index.html',
      content: this.projectStore.state.metadata.code || '',
      projectId
    };
    const response = await this.projectApi.updateFile(updateFileRequest);
    if (response && typeof response === 'object' && 'url' in response) {
      this.projectStore.setHasPreviewUrl(true);
    } else {
      throw new Error('Failed to update file');
    }
  }

  async handleSave(
    projectId: string,
    updateData: Metadata
  ): Promise<ProjectResponse | undefined> {
    const currentMetadata = this.projectStore.state.metadata;
    if (currentMetadata.code) {
      await this.updateFile(projectId);
      updateData.hasPreviewUrl = true;
    }

    const response = await this.experimentApi.updateProject(projectId, {
      metadata: updateData
    });
    return response;
  }

  async save(params: SaveParams = {}): Promise<void> {
    const { projectId = this.projectStore.state.projectId, message } = params;

    const events = params.events || this.saveEvents;
    const { nodes, edges } = this.xyFlowStore.state;

    try {
      this.saveStore.startLoading();
      const currentMetadata = this.projectStore.state.metadata;
      const saveData = ProjectSaveData.create(nodes, edges);

      if (!projectId) {
        throw new Error('Project ID not found');
      }

      const updateData = {
        ...currentMetadata,
        nodes: saveData.metadata.nodes,
        edges: saveData.metadata.edges,
        hasPreviewUrl: this.projectStore.state.hasPreviewUrl,
        hasPublishUrl: this.projectStore.state.hasPublishUrl
      };

      const response = await this.handleSave(projectId, updateData);

      if (response?.metadata) {
        this.projectStore.setMetadata(response.metadata);
        events.onMetadataSaved(message);
      }
      if (response?.properties) {
        this.projectStore.setProperties({
          publishUrl: response.properties?.publishUrl,
          previewUrl: response.properties?.previewUrl
        });
      }
    } catch (err) {
      events.onSaveError(err);
    } finally {
      this.saveStore.stopLoading();
    }
  }
}
