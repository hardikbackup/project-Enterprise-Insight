import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import jwt_encode from 'jwt-encode';
import { ModelService } from 'src/app/model/model.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @ViewChild('email') emailRef: ElementRef;
  @ViewChild('password') passwordRef: ElementRef;
  @ViewChild('portalUser') portalUser: NgbModal;
  form: UntypedFormGroup;
  firstLoad: boolean;
  isLoading: boolean;
  passwordFieldType: string;

  constructor(
      private toastCtrl: ToastrService,
      private authService: AuthService,
      private router: Router,
      private modalService : NgbModal
  ) {
  }

  ngOnInit(): void {
    this.isLoading = false;
    this.passwordFieldType = 'password';
    if (this.authService.getLoggedInUser()) {
      this.router.navigateByUrl('/dashboard');
    }
    else{
      this.firstLoad = true;
      this.form = new UntypedFormGroup({
        email: new UntypedFormControl(null, {
          updateOn: 'change',
          validators: [Validators.required]
        }),
        password: new UntypedFormControl(null, {
          updateOn: 'change',
          validators: [Validators.required]
        })
      });
    }
  }


  onSubmitLogin(): void {
    if (!this.form.valid) {
      this.isLoading = false;
      if (!this.form.value.email) {
        this.emailRef.nativeElement.focus();
      } else {
        this.passwordRef.nativeElement.focus();
      }
    }
    else{
      this.isLoading = true;
      this.authService.getLogin(this.form.value.email, this.form.value.password).subscribe(data => {
        this.isLoading = false;
        if (data.status) {
            /**Set the token into local storage*/
            let user_obj = jwt_encode({ id:data.user.id, login_key: data.user.login_key, name: data.user.name, user_role: data.user.user_role },environment.encode_api_key);
            localStorage.setItem('user', user_obj);
            localStorage.setItem('access_token', data.accessToken)
            localStorage.setItem('access_token_expiry', data.accessTokenExpiryAt)
            localStorage.setItem('refresh_token', data.accessToken)
            localStorage.setItem('refresh_token_expiry', data.refreshTokenExpiryAt)

            /**Navigate to the dashboard*/
            this.toastCtrl.success('Successfully logged in');
            this.form.reset();

            if(data.user.user_role == 'PR') {
              this.modalService.open(this.portalUser, { size : 'xl', centered: true });
            } else {
              this.router.navigateByUrl('/dashboard');
            }
        }
        else {
          this.toastCtrl.error(data.error);
        }
      });
    }
    return;
  }

  goToPortal() {
    this.modalService.dismissAll();
    this.router.navigateByUrl('publications/viewer');
  }

  logout() {
    this.modalService.dismissAll();
    this.router.navigateByUrl('auth/logout');
  }

  onResetPassword(){
    this.router.navigateByUrl('auth/forgot-password');
  }

  onRegister(){
    this.router.navigateByUrl('auth/register');
  }

  onTogglePasswordFieldType(){
    this.passwordFieldType = this.passwordFieldType == 'password' ? 'text' : 'password';
  }
}
