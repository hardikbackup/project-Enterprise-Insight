import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-invitation',
  templateUrl: './invitation.component.html',
  styleUrls: ['./invitation.component.css']
})
export class InvitationComponent {
  form: UntypedFormGroup
  inviteToken: string;
  isTokenChecking: boolean;
  isLoading: boolean;
  hasFormSubmitted: boolean;
  passwordFieldType: string;
  repeatPasswordFieldType: string;
  constructor(
      private router: Router,
      private route: ActivatedRoute,
      private toastCtrl: ToastrService,
      private authService: AuthService
  ) { }

  ngOnInit(): void {
    if (this.authService.getLoggedInUser()) {
      localStorage.clear();
    }

    this.isLoading = false;
    this.passwordFieldType = this.repeatPasswordFieldType = 'password';
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('id')) {
        this.router.navigateByUrl('auth/login');
      }

      this.form = new UntypedFormGroup({
        email: new UntypedFormControl(null),
        first_name: new UntypedFormControl(null, {
          updateOn: 'change',
          validators: [Validators.required]
        }),
        last_name: new UntypedFormControl(null, {
          updateOn: 'change',
          validators: [Validators.required]
        }),
        password: new UntypedFormControl(null, {
          updateOn: 'change',
          validators: [Validators.required]
        }),
        repeat_password: new UntypedFormControl(null, {
          updateOn: 'change',
          validators: [Validators.required]
        }),
        terms: new UntypedFormControl(null, {
          updateOn: 'change',
          validators: [Validators.required]
        }),
      });

      this.inviteToken = paramMap.get('id');
      this.isTokenChecking = true;
      this.hasFormSubmitted = false;
      this.authService.checkInviteToken(this.inviteToken).subscribe(data => {
        if (data.status) {
          this.form.controls['email'].patchValue(data.email);
        }
        else{
          this.toastCtrl.error(data.error);
          this.router.navigateByUrl('auth/login');
        }
      });
    });
  }

  onCompleteRegistration(): void {
    this.hasFormSubmitted = true;
    if (this.form.valid) {
      if (this.form.value.password == this.form.value.repeat_password) {
        this.isLoading = true;
        this.authService.onCompleteInvitation(this.inviteToken, this.form.value.first_name, this.form.value.last_name, this.form.value.password).subscribe(data => {
          this.isLoading = false;
          if (data.status) {
            this.toastCtrl.success('Password successfully set, please login');
            this.router.navigateByUrl('auth/login');
          }
          else {
            this.toastCtrl.error(data.error);
          }
        });
      }
      else{
        this.toastCtrl.error('Passwords don\'t match');
      }
    }
    else{
      this.toastCtrl.info('Please enter password and confirm it');
    }
  }

  onTogglePasswordFieldType() {
    this.passwordFieldType = this.passwordFieldType == 'password' ? 'text' : 'password'
  }

  onToggleNewPasswordFieldType() {
    this.repeatPasswordFieldType = this.repeatPasswordFieldType == 'password' ? 'text' : 'password'
  }
}
