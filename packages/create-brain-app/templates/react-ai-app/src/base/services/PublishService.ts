import { ProjectApi } from '../api/ProjectApi';
import { ProjectStore } from '../store/ProjectStore';
import { PublishStore } from '../store/PublishStore';
import { SaveProjectService } from './SaveProjectService';

/**
 * @description Publish Service
 */
export class PublishService {
  constructor(
    private readonly publishStore: PublishStore,
    private readonly projectApi: ProjectApi,
    private readonly saveProjectService: SaveProjectService,
    private readonly projectStore: ProjectStore
  ) {}

  /**
   * Trigger publish
   */
  triggerPublish(): void {
    const publishUrl = this.projectStore.state.properties?.publishUrl;

    if (!publishUrl) {
      console.warn('Publish Url is undefined');
      return;
    }
    this.publishStore.openPublishPopup(publishUrl);
  }

  /**
   * Publish
   */
  async publish(): Promise<void> {
    try {
      this.publishStore.startLoading();
      await this.saveProjectService.save();

      const response = await this.projectApi.publish(
        this.projectStore.state.projectId || ''
      );
      if (response?.properties?.publishUrl) {
        this.publishStore.changePublishedUrl(response.properties.publishUrl);
        this.projectStore.setHasPublishUrl(true);
        await this.saveProjectService.save({
          message: 'Project published successfully'
        });
      } else {
        throw new Error('Publish URL is not available');
      }
      this.publishStore.openPublishPopup();
    } catch (error) {
      this.publishStore.setPublishError(
        error instanceof Error
          ? error.message
          : 'An error occurred during publishing. Please try again later.'
      );
    } finally {
      this.publishStore.stopLoading();
    }
  }

  /**
   * @description Unpublish the project
   */
  async unPublish(): Promise<void> {
    try {
      this.publishStore.setUnPublishLoading(true);
      await this.projectApi.unpublish(this.projectStore.state.projectId || '');
      this.projectStore.setHasPublishUrl(false);

      await this.saveProjectService.save({
        message: 'Project unpublished successfully'
      });

      this.publishStore.closePublishPopup();
    } catch (error) {
      console.log(
        'Unpublish error:',
        error instanceof Error
          ? error.message
          : 'An error occurred during unpublishing. Please try again later.'
      );
    } finally {
      this.publishStore.setUnPublishLoading(false);
    }
  }
}
