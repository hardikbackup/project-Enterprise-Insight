import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../auth.service';
import { environment } from '../../../environments/environment';
import jwt_encode from 'jwt-encode';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  form: UntypedFormGroup;
  isLoading: boolean;

  constructor(
      private router: Router,
      private toastCtrl: ToastrService,
      private authService: AuthService
  ) { }

  ngOnInit(): void {
    if (this.authService.getLoggedInUser()) {
      this.router.navigateByUrl('/dashboard');
    }

    this.isLoading = false;
    this.form = new UntypedFormGroup({
      username: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      email: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required, Validators.email]
      }),
      password: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      repeat_password: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      })
    });
  }

  onRegister(): any{
    if (this.form.valid) {
      if (this.form.value.password !== this.form.value.repeat_password) {
        this.toastCtrl.info('Passwords don\'t match');
      }
      else{
        /**Process Registration*/
        this.authService.onRegister(this.form.value.username, this.form.value.email, this.form.value.password).subscribe(data => {
          if (data.status) {
            this.isLoading = false;

            /**Set the token into local storage*/
            let user_obj = jwt_encode({login_key: data.user.login_key, name: data.user.name, is_publication_viewer: false },environment.encode_api_key);
            localStorage.setItem('user',user_obj);

            /**Navigate to the dashboard*/
            this.toastCtrl.success('Successfully registered');
            this.router.navigateByUrl('dashboard');
            this.form.reset();
          }
          else {
            this.toastCtrl.error(data.error);
          }
        });
      }
    }
    else{
      if (this.form.value.email && this.form.controls.email.status !== 'VALID') {
        this.toastCtrl.info('Please type valid email');
        return;
      }

      this.toastCtrl.info('Please complete all fields');
    }
  }
}
