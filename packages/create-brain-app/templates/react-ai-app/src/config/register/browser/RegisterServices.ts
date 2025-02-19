import { ExperimentApi } from '@/base/api/ExperimentApi';
import { ProjectApi } from '@/base/api/ProjectApi';
import { UserApi } from '@/base/api/UserApi';
import {
  GetItContainerInterface,
  RegisterInterface
} from '@/base/port/GetItContainerInterface';
import { AuthService } from '@/base/services/AuthService';
import { PublishService } from '@/base/services/PublishService';
import { SaveProjectService } from '@/base/services/SaveProjectService';
import { AuthStore } from '@/base/store/AuthStore';
import { ProjectStore } from '@/base/store/ProjectStore';
import { PublishStore } from '@/base/store/PublishStore';
import { SaveStore } from '@/base/store/SaveStore';
import { UserStore } from '@/base/store/UserStore';
import { XYFlowStore } from '@/base/store/XYFlowStore';
import { SaveEvents } from '@/infra/SaveEvents';
import { Toast } from '@/views/components/toast/Toast';

export class RegisterServices implements RegisterInterface {
  configure(container: GetItContainerInterface): void {
    container.bind(
      AuthService,
      new AuthService(
        container.get(AuthStore),
        window.history,
        container.get(UserApi),
        container.get(UserStore)
      )
    );
    container.bind(SaveEvents, new SaveEvents(Toast));
    container.bind(
      SaveProjectService,
      new SaveProjectService(
        container.get(ProjectApi),
        container.get(ProjectStore),
        container.get(ExperimentApi),
        container.get(SaveStore),
        container.get(SaveEvents),
        container.get(XYFlowStore)
      )
    );

    container.bind(
      PublishService,
      new PublishService(
        container.get(PublishStore),
        container.get(ProjectApi),
        container.get(SaveProjectService),
        container.get(ProjectStore)
      )
    );
  }
}
