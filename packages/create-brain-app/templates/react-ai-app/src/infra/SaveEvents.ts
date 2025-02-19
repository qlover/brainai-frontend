import { Toast } from '@/views/components/toast/Toast';
import { SaveEventsInterface } from '@/base/port/SaveEventsInterface';

export class SaveEvents implements SaveEventsInterface {
  constructor(private uiTip: typeof Toast) {}

  onMetadataSaved(message?: string): void {
    if (message) {
      this.uiTip.success(message);
    }
  }

  onSaveError(err: unknown): void {
    console.error('Error saving project:', err);
    this.uiTip.error(
      err instanceof Error ? err.message : 'Failed to save project'
    );
  }
}
