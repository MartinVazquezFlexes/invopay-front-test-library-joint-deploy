import { HttpErrorResponse } from "@angular/common/http";

type IpServerError = {
  // Handled error
  description?: string;
  source?: 'Base' | 'Invopay';
  title?: string;
  type?: string;
  // Unhandled error
  error?: string;
  path?: string;
  timestamp?: string;
  // Both
  status?: number;
}

export default interface IpErrorResponse extends HttpErrorResponse {
  error: IpServerError;
}
