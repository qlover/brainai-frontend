import { HttpClient } from './HttpClient';

export interface UserProfile {
  phone_number: string;
  da_email: string;
}

export interface UserInfo {
  id: number;
  email: string;
  name: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  is_active: boolean;
  is_guest: boolean;
  is_superuser: boolean;
  roles: string[];
  profile: UserProfile;
  feature_tags: string[];
  tags: string[];
}

export class UserApi {
  constructor(private httpClient: HttpClient) {}

  /**
   * 获取当前用户信息
   */
  getCurrentUser(): Promise<UserInfo> {
    return this.httpClient.get('/api/users/me.json');
  }
}
