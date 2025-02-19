import { signal } from '@preact/signals-react';
import { BlocInterface } from '@/base/port/BlocInterface';
import { Toast } from '@/views/components/toast/Toast';
import { ApiDirectoryApi } from '@/base/api/ApiDirectoryApi';
import { Modal } from 'antd';
import { Props } from './ApiDetail';
import { GetIt } from '@/config/register/GetIt';

class State {
  isEditing = signal(false);
  content = signal('');
  description = signal('');
  enabled = signal(true);
  saveLoading = signal(false);
  deleteLoading = signal(false);
  name = signal('');
}

export class ApiDetailBloc extends BlocInterface<State> {
  props: Props = new Props();

  private apiDirectoryApi = GetIt.get(ApiDirectoryApi);

  constructor() {
    super(new State());
  }

  setProps(props: Props): void {
    this.props = props;
  }

  updateContent(): void {
    const currentApi = this.props.bloc.state.currentApi.value;
    if (currentApi) {
      this.state.content.value = currentApi.content;
      this.state.enabled.value = currentApi.enable;
      this.state.name.value = currentApi.name;
      this.state.description.value = currentApi.description;
    } else {
      this.state.content.value = '';
      this.state.enabled.value = true;
      this.state.name.value = '';
      this.state.description.value = '';
    }
  }

  handleEditToggle(): void {
    if (this.state.isEditing.value) {
      this.handleSave();
    }
    this.state.isEditing.value = !this.state.isEditing.value;
  }

  handleContentChange(value: string): void {
    if (this.state.isEditing.value) {
      this.state.content.value = value;
    }
  }

  handleCopy(): void {
    navigator.clipboard.writeText(this.state.content.value);
    Toast.success('Content copied to clipboard');
  }

  handleDelete(): void {
    if (!this.props.bloc.state.currentApi.value) return;

    Modal.confirm({
      title: 'Delete API',
      content: 'Are you sure you want to delete this API?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          this.state.deleteLoading.value = true;
          await this.apiDirectoryApi.deleteDocument({
            id: this.props.bloc.state.currentApi.value!.id
          });
          Toast.success('API deleted');
          await this.props.bloc.loadTreeData();
          this.props.bloc.state.currentApi.value = null;
        } catch {
          Toast.error('Failed to delete API');
        } finally {
          this.state.deleteLoading.value = false;
        }
      }
    });
  }

  handleToggleEnabled(enabled: boolean): void {
    this.state.enabled.value = enabled;
  }

  async handleSave(): Promise<void> {
    if (!this.props.bloc.state.currentApi.value) return;

    try {
      this.state.saveLoading.value = true;
      await this.apiDirectoryApi.updateDocument({
        id: this.props.bloc.state.currentApi.value.id,
        name: this.state.name.value,
        content: this.state.content.value,
        description: this.state.description.value,
        parentId: this.props.bloc.state.currentApi.value.parentId,
        enable: this.state.enabled.value
      });
      Toast.success('Changes saved');
      this.state.isEditing.value = false;
      await this.props.bloc.loadTreeData();
    } catch {
      Toast.error('Failed to save changes');
    } finally {
      this.state.saveLoading.value = false;
    }
  }

  handleCancelEdit(): void {
    this.state.isEditing.value = false;
    // 恢复原始值
    const currentApi = this.props.bloc.state.currentApi.value;
    if (currentApi) {
      this.state.content.value = currentApi.content;
      this.state.name.value = currentApi.name;
      this.state.enabled.value = currentApi.enable;
      this.state.description.value = currentApi.description;
    }
  }
}
