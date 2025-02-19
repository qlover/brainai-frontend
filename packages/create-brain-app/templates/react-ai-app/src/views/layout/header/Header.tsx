import { ProjectTitle } from '../projectTitle/ProjectTitle';
import styles from '../Layout.module.css';
import { LayoutBloc } from '../LayoutBloc';
import { HeaderHomeIcon } from './HeaderHomeIcon';
import { TopActionButtons } from '@/views/experiment/TopActionButtons/TopActionButtons';
import { useLocation } from 'react-router-dom';

export function Header({ bloc }: { bloc: LayoutBloc }) {
  const location = useLocation();

  return (
    <nav className={styles.nav}>
      <div className={styles.navLinks}>
        <button
          onClick={() => bloc.proceedToHome()}
          className={styles.homeButton}
          title="Back to Home"
        >
          <HeaderHomeIcon />
        </button>
        <div
          className={
            location.pathname.includes('/api-management')
              ? styles.projectTitleHidden
              : ''
          }
        >
          <ProjectTitle onSave={(title) => bloc.handleSaveTitle(title)} />
        </div>
      </div>

      <div className="flex-1 flex justify-end items-center">
        <TopActionButtons bloc={bloc} />
      </div>
    </nav>
  );
}
