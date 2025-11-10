import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import IpUserProfile from '../interface/ip-user-profile';

@Injectable({
  providedIn: 'root'
})
export class IpProfileService {
  api = environment.api;


  constructor(
    private http: HttpClient,
  ) {
  }

  getUserProfile(): Observable<IpUserProfile> {
    return this.http.get<IpUserProfile>(
      `${this.api}/invopay/users/profile`
    );
  }

}
