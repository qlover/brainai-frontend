import React from 'react';
import { BlocInterface } from '@/base/port/BlocInterface';
import { ProjectStore } from '@/base/store/ProjectStore';
import { GetIt } from '@/config/register/GetIt';
import { signal } from '@preact/signals-react';

export interface ProjectTitleBlocProps {
  onSave?: (newTitle: string) => Promise<void>;
}

class State {
  isEditing = signal(false);
  editValue = signal('');
  showSavePrompt = signal(false);
  isSaving = signal(false);
  currentTitle = signal('');
  error = signal<string | null>(null);
}
export class ProjectTitleBloc extends BlocInterface<State> {
  private projectStore = GetIt.get(ProjectStore);
  private props: ProjectTitleBlocProps = {};

  constructor() {
    super(new State());
    this.state.currentTitle.value =
      this.projectStore.state.metadata.name || 'Untitled';
  }
  setProps(props: ProjectTitleBlocProps): void {
    this.props = props;
  }

  updateTitle(): void {
    this.state.currentTitle.value =
      this.projectStore.state.metadata.name || 'Untitled';
  }

  get isLoading(): boolean {
    return !this.state.currentTitle.value;
  }

  handleDoubleClick(): void {
    if (!this.isLoading) {
      this.state.isEditing.value = true;
      this.state.editValue.value = this.state.currentTitle.value;
    }
  }

  handleSave(): void {
    const trimmedValue = this.state.editValue.value.trim();
    if (!trimmedValue) {
      this.state.error.value = 'Project name cannot be empty';
      return;
    }
    this.state.error.value = null;
    if (trimmedValue !== this.state.currentTitle.value) {
      this.state.showSavePrompt.value = true;
    } else {
      this.handleCancel();
    }
  }

  handleCancel(): void {
    this.state.isEditing.value = false;
    this.state.showSavePrompt.value = false;
    this.state.editValue.value = this.state.currentTitle.value;
  }

  async confirmSave(): Promise<void> {
    const trimmedValue = this.state.editValue.value.trim();
    if (!trimmedValue) return;

    try {
      this.state.isSaving.value = true;
      await this.props.onSave?.(trimmedValue);
      this.state.isEditing.value = false;
      this.state.showSavePrompt.value = false;
      this.state.error.value = null;
    } catch {
      this.state.error.value = 'Failed to save project name';
    } finally {
      this.state.isSaving.value = false;
    }
  }

  handleKeyDown(e: React.KeyboardEvent<HTMLElement>): void {
    if (e.key === 'Enter') {
      if (this.state.showSavePrompt.value) {
        this.confirmSave();
      } else {
        this.handleSave();
      }
    } else if (e.key === 'Escape') {
      this.handleCancel();
    }
  }
}
