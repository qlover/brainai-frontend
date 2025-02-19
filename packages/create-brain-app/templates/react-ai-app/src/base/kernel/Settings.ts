import { Configuration } from 'js-cutil/dist/base/cutil/Configuration';
import { SyncStorage } from 'js-cutil/dist/base/cutil/SyncStorage';

function parseEnv() {
  const domain = ['imagica.brain.loocaa.com'];

  if (domain.includes(window.location.hostname)) {
    return window.location.hostname;
  }
  return import.meta.env.VITE_APP_ENV ?? 'development';
}

const configuration = new Configuration(
  {
    imagicaUrl: {
      production: 'https://dashboard.braininc.net/fot/#/editor',
      development: 'https://dashboard.brainllc.net/fot/#/editor',
      'imagica.brain.loocaa.com': 'https://dashboard.brainllc.net/fot/#/editor'
    },
    imagicaApiUrl: {
      production: 'https://api.braininc.net',
      development: 'https://api-dev.braininc.net',
      'imagica.brain.loocaa.com': 'https://api-dev.braininc.net'
    },
    domainApiUrl: {
      production: 'https://imagica.brain.loocaa.com:1443',
      development: 'https://imagica.brain.loocaa.com:1443',
      'imagica.brain.loocaa.com': 'https://imagica.brain.loocaa.com:1443'
    }
  },
  parseEnv(),
  sessionStorage as unknown as SyncStorage,
  window.location.search
);

export class Settings {
  public projectManageApiBaseUrl: string =
    configuration.extract('domainApiUrl') + '/api/imagica';
  public imagicaUrl: string = configuration.extract('imagicaUrl');
  public reactFlowApiUrl: string =
    configuration.extract('domainApiUrl') + '/api/reactflow';
  public apiFinderUrl: string =
    configuration.extract('domainApiUrl') + '/api/apifinder/api';
  public domainApiUrl: string = configuration.extract('domainApiUrl');
  public imagicaApiUrl: string = configuration.extract('imagicaApiUrl');
}

export const settings = new Settings();
