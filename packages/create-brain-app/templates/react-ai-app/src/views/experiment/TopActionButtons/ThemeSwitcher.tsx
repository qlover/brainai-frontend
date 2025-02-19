import { ThemeStore } from '@/base/store/ThemeStore';
import { GetIt } from '@/config/register/GetIt';
import { useStore } from '@/uikit/hooks/useStore';
import { Tooltip } from 'antd';

export type ThemeSwitcherProps = {
  className?: string;
};

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const themeStore = GetIt.get(ThemeStore);
  const themeStoreState = useStore(themeStore);

  return (
    <Tooltip
      title={
        themeStoreState.isDarkMode
          ? 'Switch to light mode'
          : 'Switch to dark mode'
      }
    >
      <button onClick={() => themeStore.toggleDarkMode()} className={className}>
        <span>{themeStoreState.isDarkMode ? '☀️' : '🌙'}</span>
      </button>
    </Tooltip>
  );
}
