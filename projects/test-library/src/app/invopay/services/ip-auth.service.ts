import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RoleResponse } from '../interface/ip-role-response';
import { LoginData } from '../interface/Iip-login';
import { User } from '../interface/Iip-user';

@Injectable({
  providedIn: 'root',
})
export class IpAuthService {
  api = environment.api;

  private sessionSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  public currentSession$: Observable<boolean> =
    this.sessionSubject.asObservable();
  private userRole?: RoleResponse;

  constructor(
    private httpClient: HttpClient,
    private router: Router,
  ) {
    if (this.getToken()) {
      this.sessionSubject.next(true);
    }
  }

  public login(
    loginUser: LoginData,
    isAdminLogin: boolean = false
  ): Observable<User> {
    return this.httpClient
      .post<User>(`${this.api}/invopay/users/signIn`, loginUser)
      .pipe(map((resp) => this.mapUser(resp)));
  }

  private mapUser(resp: User) {
    if (resp.access_token) {
      // TODO: remove this line:
      // Just in case:
      sessionStorage.clear()
      // It's important to set 'path'
      // Otherwise, they won't be deleted afterwards
      sessionStorage.setItem('access_token', resp.access_token);
      sessionStorage.setItem('username', resp.username);
      sessionStorage.setItem('userType', resp.userType);
      sessionStorage.setItem('userId', JSON.stringify(resp.id));
      if (resp.supplierSignInReponse) {
        sessionStorage.setItem('isBroker', resp.supplierSignInReponse.isBroker);
      }
      if (resp.roleResponse) {
        this.setUserRole(resp.roleResponse)
      }
      this.sessionSubject.next(true);
      return resp;
    }
    throw new Error('Missing token.');
  }

  public getToken() {
    return sessionStorage.getItem('access_token') ?? false;
  }

  public logOut() {
    if (this.getToken()) {
      // This checks wether the user was logged in a an employee
      // Why? So that they get redirected back to employees' login
      // and not to admins' login

      sessionStorage.clear()
      this.sessionSubject.next(false);
      this.router.navigate(['/login']);
    }
  }

  public sendResetPasswordEmail(email: string) {
    return this.httpClient.get(
      `${this.api}/invopay/users/reset-password-email`,
      { params: { email } }
    );
  }

  public resetPassword(newPassword: string, token: string) {
    return this.httpClient.get(`${this.api}/invopay/users/reset-password`, {
      params: { newPassword, token },
    });
  }

  public getUserRole() {
    return this.userRole
  }

  public setUserRole(userRole: RoleResponse) {
    this.userRole = userRole
  }



}
