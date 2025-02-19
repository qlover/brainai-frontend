import { signal } from '@preact/signals-react';
import { BlocInterface } from '@/base/port/BlocInterface';
import { ProjectListApi, ProjectListItem } from '@/base/api/ProjectListApi';
import { GetIt } from '@/config/register/GetIt';
import { Modal } from 'antd';

export interface HomePageState {
  projects: ProjectListItem[];
  loading: boolean;
}

class State {
  projects = signal<ProjectListItem[]>([]);
  loading = signal(false);
}

export class HomePageBloc extends BlocInterface<State> {
  private projectListApi = GetIt.get(ProjectListApi);

  constructor() {
    super(new State());
  }

  async fetchProjects(): Promise<void> {
    try {
      this.state.loading.value = true;
      const response = await this.projectListApi.getProjectList({
        pageIndex: 1,
        pageSize: 100,
        sortProperties: 'updated'
      });
      this.state.projects.value = response.items || [];
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      this.state.loading.value = false;
    }
  }

  async createProject(): Promise<string | undefined> {
    if (this.state.loading.value) return;

    try {
      this.state.loading.value = true;
      const response = await this.projectListApi.createProject();
      return response?.id;
    } catch (err) {
      console.error('Error creating project:', err);
    } finally {
      this.state.loading.value = false;
    }
  }

  showDeleteConfirmModal(id: string): void {
    Modal.confirm({
      title: 'Confirm Delete',
      content:
        'Are you sure you want to delete this project? This action cannot be undone.',
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: () => this.deleteProject(id),
      okButtonProps: { danger: true }
    });
  }

  async deleteProject(id: string): Promise<void> {
    if (this.state.loading.value) return;

    try {
      this.state.loading.value = true;
      await this.projectListApi.deleteProject(id);
      await this.fetchProjects();
    } catch (err) {
      console.error('Error deleting project:', err);
    } finally {
      this.state.loading.value = false;
    }
  }
}
