import { BlocInterface } from '@/base/port/BlocInterface';
import { signal } from '@preact/signals-react';
import { GetIt } from '@/config/register/GetIt';
import { ProjectStore } from '@/base/store/ProjectStore';
import { AppStore } from '@/base/store/AppStore';
import { XYFlowStore } from '@/base/store/XYFlowStore';
import { SaveProjectService } from '@/base/services/SaveProjectService';
import { Toast } from '@/views/components/toast/Toast';
import { ExperimentApi, ProjectSaveData } from '@/base/api/ExperimentApi';
import { settings } from '@/base/kernel/Settings';
import { isLocalHost } from '@/uikit/utils/env';
import { Blocker, Location } from 'react-router-dom';

class Props {
  isInitializing: boolean = false;
  projectId: string | undefined = undefined;
  navigate: (path: string) => void = () => {};
  location: Location = {
    state: {},
    key: '',
    pathname: '',
    search: '',
    hash: ''
  };
}

class State {
  showSaveModal = signal(false);
  nextLocation = signal<string | null>(null);
  isSaving = signal(false);
  notFound = signal(false);
  showActions = signal(false);
}

export class LayoutBloc extends BlocInterface<State> {
  private appStore = GetIt.get(AppStore);
  private projectStore = GetIt.get(ProjectStore);
  private xyFlowStore = GetIt.get(XYFlowStore);
  private saveProjectService = GetIt.get(SaveProjectService);
  private experimentApi = GetIt.get(ExperimentApi);

  props: Props = new Props();

  constructor() {
    super(new State());
  }

  setProps(props: Props): void {
    this.props = props;
  }

  resetState(): void {
    this.state.showSaveModal.value = false;
    this.xyFlowStore.resetState();
    this.projectStore.resetState();
  }

  // 处理页面刷新和关闭
  handleBeforeUnload = (e: BeforeUnloadEvent): void => {
    if (this.projectStore.hasUnsavedChanges()) {
      e.preventDefault();
      return;
    }
  };

  // 添加和移除 beforeunload 事件监听
  setupBeforeUnloadListener(): void {
    window.addEventListener('beforeunload', this.handleBeforeUnload);
  }

  cleanupBeforeUnloadListener(): void {
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
  }

  async handleSaveAndExit(): Promise<void> {
    try {
      const id = this.props.projectId || '';
      const saveData = ProjectSaveData.create(
        this.xyFlowStore.state.nodes,
        this.xyFlowStore.state.edges
      );
      const updateData = {
        ...this.projectStore.state.metadata,
        nodes: saveData.metadata.nodes,
        edges: saveData.metadata.edges,
        hasPreviewUrl: this.projectStore.state.hasPreviewUrl,
        hasPublishUrl: this.projectStore.state.hasPublishUrl
      };
      this.state.isSaving.value = true;
      await this.saveProjectService.handleSave(id, updateData);
      Toast.success('Project saved successfully');
      this.handleLocationChange();
    } catch (error) {
      Toast.error('Failed to save project');
      console.error('Error saving project:', error);
    } finally {
      this.state.isSaving.value = false;
    }
  }

  handleLocationChange(): void {
    this.resetState();
    if (this.state.nextLocation.value) {
      this.props.navigate(this.state.nextLocation.value);
    }
  }

  async handleSaveTitle(newTitle: string): Promise<void> {
    try {
      const currentId = this.props.projectId || '';
      const currentMetadata = this.projectStore.state.metadata;
      const updateData = {
        metadata: {
          ...currentMetadata,
          name: newTitle
        }
      };

      const response = await this.experimentApi.updateProject(
        currentId,
        updateData
      );
      if (response?.metadata) {
        this.projectStore.setMetadata(response.metadata);
      }
    } catch (err) {
      console.error('Error saving title:', err);
    }
  }
  // 这里必须使用箭头函数，否则使用的地方类型会报错
  getUrlWithId = (path: string): string => {
    return this.props.projectId ? `${path}/${this.props.projectId}` : path;
  };

  proceedToHome(): void {
    // 回到首页时，如果项目没有未保存的更改，则重置项目状态
    if (!this.projectStore.hasUnsavedChanges()) {
      this.resetState();
    }
    if (isLocalHost) {
      this.props.navigate('/');
    } else {
      window.location.href = settings.imagicaUrl;
    }
  }

  setupProjectId(): void {
    if (this.props.isInitializing) {
      return;
    }
    // 如果是本地环境的首页，不进行 ID 检查
    if (isLocalHost && this.props.location.pathname === '/') {
      this.state.notFound.value = false;
      return;
    }
    // 只在非首页路径且有 projectId 时进行检查
    const currentId = this.props.projectId || '';
    if (currentId && !Number(currentId)) {
      this.state.notFound.value = true;
      return;
    }
    this.state.notFound.value = false;
  }

  switchShowActions(): void {
    this.state.showActions.value =
      this.props.location.pathname.includes('/experiment');
  }

  handleLocationCompare(
    currentLocation: Location,
    nextLocation: Location
  ): boolean {
    return (
      this.projectStore.hasUnsavedChanges() &&
      currentLocation.pathname !== nextLocation.pathname
    );
  }

  handleBlocker(blocker: Blocker): void {
    if (blocker.state === 'blocked') {
      const pathname = blocker.location.pathname.replace('/reactflow', '');
      this.state.showSaveModal.value = true;
      this.state.nextLocation.value = pathname;
    }
  }

  onCloseButton(): void {
    const { lastProjectId } = this.appStore.state;
    const navigateTo = lastProjectId
      ? `/experiment/${lastProjectId}`
      : isLocalHost
        ? '/'
        : settings.imagicaUrl;

    this.appStore.clearLastProjectId();
    if (lastProjectId || isLocalHost) {
      // 如果有项目id则返回项目详情页
      // 如果没有项目id且是本地开发则返回首页
      this.props.navigate(navigateTo);
    } else {
      window.location.href = navigateTo;
    }
  }

  toDocPage(): void {
    // 缓存当前项目的id
    if (this.projectStore.state.projectId) {
      this.appStore.setLastProjectId(this.projectStore.state.projectId);
    }
    this.props.navigate('/api-management');
  }
}
