import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';
import { ProjectList } from './ProjectList';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CircularProgress from '@mui/material/CircularProgress';
import { HomePageBloc } from './HomePageBloc';
import { useBloc } from '@/uikit/hooks/useBloc';

export function HomePage() {
  const bloc = useBloc(HomePageBloc);
  const navigate = useNavigate();

  useEffect(() => {
    bloc.fetchProjects();
  }, [bloc]);

  const handleCreateProject = async () => {
    const id = await bloc.createProject();
    if (id) {
      navigate(`/experiment/${id}`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>React Flow UI Design</h1>
        <button
          onClick={handleCreateProject}
          className={styles.createButton}
          data-testid="HomePage-CreateProjectButton"
          title="create new project"
          disabled={bloc.state.loading.value}
        >
          {bloc.state.loading.value ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <AddCircleIcon sx={{ fontSize: 32, color: 'white' }} />
          )}
        </button>
      </div>
      {bloc.state.loading.value && !bloc.state.projects.value.length ? (
        <div
          className={styles.loadingContainer}
          data-testid="loading-container"
        >
          <CircularProgress size={40} />
          <p>loading project list...</p>
        </div>
      ) : (
        <ProjectList
          projects={bloc.state.projects}
          onDelete={(id) => bloc.showDeleteConfirmModal(id)}
          onSelect={(id) => navigate(`/experiment/${id}`)}
          loading={bloc.state.loading}
        />
      )}
    </div>
  );
}
