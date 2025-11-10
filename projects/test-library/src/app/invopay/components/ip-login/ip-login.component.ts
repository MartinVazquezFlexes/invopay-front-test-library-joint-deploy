import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { LoginData } from '../../interface/Iip-login';
import IpErrorResponse from '../../interface/ip-error-response';
import { IpAuthService } from '../../services/ip-auth.service';
import { IpProfileService } from '../../services/ip-profile.service';
import { IpSnackbarService } from '../../services/ip-snackbar.service';

@Component({
  selector: 'app-ip-login',
  templateUrl: './ip-login.component.html',
  styleUrls: ['./ip-login.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class IpLoginComponent implements OnInit, OnDestroy {
  // @Input() provider: boolean = true;
  provider: boolean = false;
  email: string = '';
  nameCompany$: Observable<String> = new BehaviorSubject<String>('Invopay').asObservable();
  isSubmitted: boolean = false;
  showPassword: boolean = false;
  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });
  restorePasswordForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });
  step:
    | 'login'
    | 'restorePassword'
    | 'restoreSuccess'
    | 'signup'
    | 'signup_success' = 'login';
  errorMessage: string = '';
  onRouteChangeSub: Subscription = new Subscription();
  isAdminLogin: boolean = true;
  registerButton = false;
  routeExtension?: 'login-broker' | 'login-admin';

  constructor(
    public dialog: MatDialog,
    public newAccountUser: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private authService: IpAuthService,
    private translateService: TranslateService,
    private ipProfileService: IpProfileService,
    private ipSnackbarService: IpSnackbarService,
  ) { }

  ngOnInit() {
    const currentRoute = this.router.url;
    const currentRouteArray = currentRoute.split('/');
    this.routeExtension = currentRouteArray.at(
      currentRouteArray.length - 1
    ) as 'login-broker' | 'login-admin';
  }



  switchPasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  submitLogin() {
    this.isSubmitted = true;
    if (this.loginForm.valid) {
      const loginData: LoginData = {
        email: this.loginForm.get('email')?.value as string,
        password: this.loginForm.get('password')?.value as string,
        isBroker: this.routeExtension === 'login-broker' ? true : undefined
      };
      const errorHandler = (e: IpErrorResponse) => {
        this.authService.logOut();
        this.ipSnackbarService.showErrorMessage(e);
      };
      this.authService.login(loginData, this.isAdminLogin).subscribe({
        next: (resp) => {
          this.router.navigate(['/invopay/home']).then().catch(errorHandler);
        },
        error: (e: HttpErrorResponse) => {
          if (e.error.description) {
            this.errorMessage = e.error.description;
          } else {
            this.errorMessage = this.translateService.instant(
              'IP.LOGIN.BAD-CREDENTIALS'
            );
          }
        },
      });
    } else {
      console.log('Form is invalid');
    }
  }

  submitRestorePassword() {
    this.isSubmitted = true;
    if (this.restorePasswordForm.valid) {
      const email = this.restorePasswordForm.get('email')?.value as string;
      this.authService.sendResetPasswordEmail(email).subscribe({
        next: () => {
          this.step = 'restoreSuccess';
        },
        error: (e: HttpErrorResponse) => {
          if (e.error.description) {
            this.errorMessage = e.error.description;
          } else {
            this.errorMessage = this.translateService.instant(
              'IP.LOGIN.RESTORE.SERVER-ERROR'
            );
          }
        },
      });
    } else {
      console.log('Form is invalid');
    }
  }


  resetServerProps() {
    this.errorMessage = '';
    this.isSubmitted = false;
  }

  onRestorePasswordClick() {
    this.resetServerProps();
    this.step = 'restorePassword';
  }

  onGoBackClick() {
    this.step = 'login';
  }

  onSignup() {
    this.resetServerProps();
    this.step = 'signup';
  }


  ngOnDestroy(): void {
    this.nameCompany$.subscribe().unsubscribe();
  }


}
