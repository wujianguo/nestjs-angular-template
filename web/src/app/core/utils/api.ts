import { environment } from '../../../environments/environment';

export function buildAPI(endpoint: string) {
  return `${environment.api}${endpoint}`;
}
