import { signal } from '@preact/signals-react';
import { BlocInterface } from '@/base/port/BlocInterface';
import {
  GetSuggestionsApiResult,
  ImagicaReactflowApi
} from '@/base/api/ImagicaReactflowApi';
import { GetIt } from '@/config/register/GetIt';
import { debounce } from 'lodash';
import { settings } from '@/base/kernel/Settings';
import { XYFlowEdge, XYFlowNode, XYFlowStore } from '@/base/store/XYFlowStore';
import { ProjectStore } from '@/base/store/ProjectStore';
import { ExperimentApi } from '@/base/api/ExperimentApi';
import { ChangeEvent, FormEvent } from 'react';
import { MarkerType } from '@xyflow/react';
import { Toast } from '@/views/components/toast/Toast';
import { PreviewStore } from '@/base/store/PreviewStore';
import { PublishStore } from '@/base/store/PublishStore';

class DesignResult {
  code: string = '';
}

class State {
  command = signal('');
  loading = signal(false);
  error = signal<string | null>(null);
  designResult = signal<DesignResult | null>(null);
  apiSuggestions = signal<GetSuggestionsApiResult['response'] | null>(null);
  suggestionsLoading = signal(false);
  isFirstQuery = signal(true);
  isCopied = signal(false);
  showCopyToast = signal(false);
}

export class ExperimentBloc extends BlocInterface<State> {
  constructor() {
    super(new State());
  }
  private imagicaReactflowApi = GetIt.get(ImagicaReactflowApi);
  private projectStore = GetIt.get(ProjectStore);
  private xyFlowStore = GetIt.get(XYFlowStore);
  private experimentApi = GetIt.get(ExperimentApi);
  private previewStore = GetIt.get(PreviewStore);
  private publishStore = GetIt.get(PublishStore);

  suggestApisDebounced = debounce(async (input: string): Promise<void> => {
    if (!input.trim()) {
      this.state.apiSuggestions.value = null;
      return;
    }

    this.state.suggestionsLoading.value = true;
    try {
      const data = await this.imagicaReactflowApi.getSuggestionsApi({
        input: input.trim()
      });

      if (data.error) {
        console.error('Error getting API suggestions:', data.error);
        this.state.error.value = data.error;
        throw new Error(data.error);
      }

      this.state.apiSuggestions.value = data;
    } catch (err) {
      console.error('Error getting API suggestions:', err);
    } finally {
      this.state.suggestionsLoading.value = false;
    }
  }, 500);

  // Update command change handler to use debounced API suggestions
  handleCommandChange(e: ChangeEvent<HTMLInputElement>): void {
    const newCommand = e.target.value;
    this.state.command.value = newCommand;
    this.suggestApisDebounced(newCommand);
  }

  // Process nodes function
  processNodes(newNodes: XYFlowNode[]): XYFlowNode[] {
    console.log('Processing nodes:', newNodes);
    return newNodes.map((node: XYFlowNode) => ({
      ...node,
      type: 'custom', // Ensure all nodes use our custom type
      position: node.position || { x: 0, y: 0 },
      style: {
        ...node.style,
        width: node.style?.width || 'auto',
        height: node.style?.height || 'auto'
      }
    }));
  }

  handleSetNodes(newNodes: XYFlowNode[]): void {
    const processedNodes = this.processNodes(newNodes);
    this.xyFlowStore.changeNodes(processedNodes);
  }

  async handleCommandSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!this.state.command.value.trim() || this.state.loading.value) return;

    this.state.loading.value = true;
    this.state.error.value = null;

    try {
      // First call process-command API and update the flow immediately
      const flowResponse = await fetch(
        settings.reactFlowApiUrl + '/process-command',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            command: this.state.command.value.trim()
          })
        }
      );

      if (!flowResponse.ok) {
        throw new Error('Failed to process command');
      }

      const flowData = await flowResponse.json();
      console.log('Raw flow data:', flowData);

      if (!flowData.nodes || !flowData.edges) {
        throw new Error('Invalid flow data structure received');
      }

      // Process and set nodes first
      this.handleSetNodes(flowData.nodes);

      // Process and set edges
      console.log('Setting edges:', flowData.edges);
      const processedEdges = flowData.edges.map((edge: XYFlowEdge) => ({
        ...edge,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#555', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed }
      }));
      console.log('Processed edges:', processedEdges);
      this.xyFlowStore.changeEdges(processedEdges);

      // Force a re-render of ReactFlow
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);

      // Then call process-design-with-code API
      const codeData = await this.imagicaReactflowApi.processDesignWithCode({
        prompt: this.state.command.value.trim(),
        apis: this.state.apiSuggestions.value?.selectedApis || []
      });

      if ('error' in codeData) {
        console.error('Error generating code implementation:', codeData.error);
        this.state.error.value = codeData.error;
        throw new Error('Failed to generate code implementation');
      }

      this.projectStore.setMetadata({
        ...this.projectStore.state.metadata,
        code: codeData.code
      });

      this.state.designResult.value = codeData;

      this.previewStore.openPopup();
      this.state.command.value = '';
    } catch (err) {
      console.error('Error in handleCommandSubmit:', err);
      this.state.error.value = (err as Error).message;
    } finally {
      this.state.loading.value = false;
    }
  }

  async handleUpdateSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!this.state.command.value.trim() || this.state.loading.value) return;

    this.state.loading.value = true;
    this.state.error.value = null;

    try {
      const currentGraph = {
        nodes: this.xyFlowStore.state.nodes,
        edges: this.xyFlowStore.state.edges
      };

      // First update the flow diagram
      const flowResponse = await fetch(
        settings.reactFlowApiUrl + '/update-graph',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            command: this.state.command.value.trim(),
            currentGraph
          })
        }
      );

      if (!flowResponse.ok) {
        throw new Error('Failed to update graph');
      }

      const flowData = await flowResponse.json();
      console.log('Flow data:', flowData);

      if (!flowData.nodes || !flowData.edges) {
        throw new Error('Invalid flow data structure received');
      }

      // Update flow immediately
      this.handleSetNodes(flowData.nodes);
      this.xyFlowStore.changeEdges(flowData.edges);

      // Force a re-render of ReactFlow
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);

      // Then update the code implementation
      const codeData = await this.imagicaReactflowApi.processDesignWithCode({
        prompt: this.state.command.value.trim(),
        apis: this.state.apiSuggestions.value?.selectedApis || []
      });

      if ('error' in codeData) {
        throw new Error('Failed to update code implementation');
      }

      this.projectStore.setMetadata({
        ...this.projectStore.state.metadata,
        code: codeData.code
      });

      this.state.designResult.value = codeData;
      this.previewStore.openPopup();
      this.state.command.value = '';
    } catch (err) {
      console.error('Error in handleUpdateSubmit:', err);
      this.state.error.value = (err as Error).message;
    } finally {
      this.state.loading.value = false;
    }
  }

  async handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.publishStore.state.publishedUrl);
      this.state.isCopied.value = true;
      this.state.showCopyToast.value = true;
      setTimeout(() => {
        this.state.showCopyToast.value = false;
      }, 3000); // Hide after 3 seconds
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  async loadProjectData(targetProjectId?: string): Promise<void> {
    if (!targetProjectId || !Number(targetProjectId)) return;

    try {
      const response = await this.experimentApi.getProject(targetProjectId);

      if (response?.metadata) {
        this.projectStore.setProjectId(targetProjectId);
        // 更新 ProjectStore
        this.projectStore.setMetadata(response.metadata);
        // 设置 savedCode
        this.projectStore.setSavedCode(response.metadata.code || '');
        this.projectStore.setProperties(response.properties);
        this.projectStore.setHasPreviewUrl(
          response.metadata.hasPreviewUrl || false
        );
        this.projectStore.setHasPublishUrl(
          response.metadata.hasPublishUrl || false
        );

        // 解析并设置 nodes 和 edges
        if (response.metadata.nodes && response.metadata.edges) {
          const parsedNodes = JSON.parse(response.metadata.nodes);
          const parsedEdges = JSON.parse(response.metadata.edges);
          this.xyFlowStore.changeNodes(parsedNodes);
          this.xyFlowStore.changeEdges(parsedEdges);
        }
      }
    } catch (err) {
      console.error('Error loading project data:', err);
      Toast.error(
        err instanceof Error ? err.message : 'Failed to load project data'
      );
      // 设置默认值
      const metadata = { name: 'Untitled' };
      this.projectStore.setMetadata(metadata);
      this.projectStore.setSavedCode('');
      this.projectStore.setProperties({});
    }
  }
}
