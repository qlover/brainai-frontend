import styles from './HomePage.module.css';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import UpdateIcon from '@mui/icons-material/Update';
import { ProjectListItem } from '@/base/api/ProjectListApi';
import { Signal } from '@preact/signals-react';

interface ProjectListProps {
  projects: Signal<ProjectListItem[]>;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  loading?: Signal<boolean>;
}

export const ProjectList = ({
  projects,
  onDelete,
  onSelect,
  loading
}: ProjectListProps) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.projectList} data-testid="HomePage-ProjectList">
      {projects.value.map((project) => (
        <div
          data-testid={`HomePage-ProjectList-ProjectItem`}
          key={project.id}
          className={`${styles.projectItem} ${loading?.value ? styles.disabled : ''}`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project.id);
            }}
            className={styles.deleteButton}
            title="delete project"
            disabled={loading?.value}
            data-testid={`ProjectItem-DeleteButton`}
          >
            <DeleteOutlineIcon sx={{ fontSize: 20 }} />
          </button>
          <div
            data-testid={`ProjectItem-Main`}
            className={styles.projectInfo}
            onClick={() => !loading?.value && onSelect(project.id)}
          >
            <h3 className={styles.projectName}>{project.metadata.name}</h3>
            <div className={styles.projectMeta}>
              <span data-testid="created-time">
                <AccessTimeIcon sx={{ fontSize: 16 }} />
                created at: {formatDate(project.created)}
              </span>
              <span data-testid="updated-time">
                <UpdateIcon sx={{ fontSize: 16 }} />
                updated at: {formatDate(project.updated)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
