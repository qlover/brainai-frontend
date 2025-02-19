import React, { ReactNode } from 'react';
import styles from './NotFound.module.css';
import { settings } from '@/base/kernel/Settings';

class NotFoundProps {
  constructor(public message?: string) {
    this.message = message || 'Project not found';
  }
}

class NotFoundComponent extends React.Component<NotFoundProps> {
  handleBack = (): void => {
    window.location.href = `${settings.imagicaUrl}`;
  };

  render(): ReactNode {
    const { message } = this.props;

    return (
      <div className={styles.notFound}>
        <h1>404</h1>
        <p>{message}</p>
        <button onClick={this.handleBack} className={styles.backButton}>
          Back to Home
        </button>
      </div>
    );
  }
}

export const NotFound: React.FC<NotFoundProps> = (props) => {
  return <NotFoundComponent {...props} />;
};
