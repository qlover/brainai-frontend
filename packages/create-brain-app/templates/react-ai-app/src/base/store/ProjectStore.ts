import { GenUtil } from 'js-cutil/dist/base/cutil/GenUtil';
import { ProjectResponse } from '../api/ExperimentApi';
import { StoreInterface, StoreStateInterface } from '../port/StoreInterface';

type ProjectProperties = {
  publishUrl?: string;
  previewUrl?: string;
};

export class ProjectStoreState implements StoreStateInterface {
  projectId: string = '';
  properties: ProjectProperties = {};
  metadata: ProjectResponse['metadata'] = {
    name: ''
  };
  hasPreviewUrl: boolean = false;
  hasPublishUrl: boolean = false;
  savedCode: string = '';

  copyWith(state: {
    projectId?: string;
    properties?: ProjectProperties;
    metadata?: ProjectResponse['metadata'];
    hasPreviewUrl?: boolean;
    hasPublishUrl?: boolean;
    savedCode?: string;
  }): ProjectStoreState {
    return GenUtil.copyWith(new ProjectStoreState(), this, state);
  }
}
export class ProjectStore extends StoreInterface<ProjectStoreState> {
  constructor() {
    super(() => new ProjectStoreState());
  }

  setMetadata(metadata: ProjectResponse['metadata']): void {
    this.emit(this.state.copyWith({ metadata }));
  }

  clear(): void {
    this.emit(this.state.copyWith({ metadata: { name: '' } }));
    this.setHasPreviewUrl(false);
  }

  setProperties(properties: ProjectResponse['properties']): void {
    this.emit(this.state.copyWith({ properties }));
  }

  setHasPreviewUrl(hasPreviewUrl: boolean): void {
    this.emit(this.state.copyWith({ hasPreviewUrl }));
  }

  setHasPublishUrl(hasPublishUrl: boolean): void {
    this.emit(this.state.copyWith({ hasPublishUrl }));
  }

  /**
   * @override
   */
  resetState(): void {
    this.clear();
    super.resetState();
  }

  setSavedCode(code: string): void {
    this.emit(this.state.copyWith({ savedCode: code }));
  }

  hasUnsavedChanges(): boolean {
    return (
      !!this.state.metadata.code &&
      this.state.metadata.code !== this.state.savedCode
    );
  }

  setProjectId(projectId: string): void {
    this.emit(this.state.copyWith({ projectId }));
  }
}
