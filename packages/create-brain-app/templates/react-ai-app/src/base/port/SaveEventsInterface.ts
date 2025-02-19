/**
 * 保存事件接口
 */
export interface SaveEventsInterface {
  onMetadataSaved(message?: string): void;
  onSaveError(err: unknown): void;
}
