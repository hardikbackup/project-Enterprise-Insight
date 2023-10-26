import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  form: UntypedFormGroup;
  globalSettings:any
  forgotPasswordToken: string;
  isLoading: boolean;
  newPasswordFieldType: string;
  repeatPasswordFieldType: string;
  constructor(
      private router: Router,
      private route: ActivatedRoute,
      private toastCtrl: ToastrService,
      private authService: AuthService
  ) { }

  ngOnInit(): void {
    localStorage.clear();
  this.isLoading = false;
    this.newPasswordFieldType = this.repeatPasswordFieldType = 'password';
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('id')) {
        this.router.navigateByUrl('auth/login');
      }

      this.forgotPasswordToken = paramMap.get('id');
      this.form = new UntypedFormGroup({
        new_password: new UntypedFormControl(null, {
          updateOn: 'change',
          validators: [Validators.required,this.checkUserSettingsValidators.bind(this)]
        }),
        repeat_password: new UntypedFormControl(null, {
          updateOn: 'change',
          validators: [Validators.required]
        })
      });
    });
    this.getUserSettings()
  }

  onResetPassword(): void {
    if (this.form.valid) {
      if (this.form.value.new_password == this.form.value.repeat_password) {
        this.isLoading = true;
        this.authService.onResetPassword(this.form.value.new_password, this.forgotPasswordToken).subscribe(data => {
          this.isLoading = false;
          if (data.status) {
            this.toastCtrl.success('Password successfully changed');
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
      this.toastCtrl.info('Please enter new password and confirm it');
    }
  }

  onToggleNewPasswordFieldType() {
    this.newPasswordFieldType = this.newPasswordFieldType == 'password' ? 'text' : 'password';
  }

  onToggleRepeatPasswordFieldType() {
    this.repeatPasswordFieldType = this.repeatPasswordFieldType == 'password' ? 'text' : 'password';
  }
 
  getUserSettings() {
    this.authService.getGlobalSettings().subscribe(data => {
      this.globalSettings = data;
    })
  }


  checkUserSettingsValidators(control: any) {
    const password = control.value;
    if (!password) {
      return { requiredError: true };
    }
    if (this.globalSettings.required_minimum_length && password.length < this.globalSettings.password_length) {
        return { lengthError: true };
    }
    const hasSpecialCharacter = /[!@#$%()&*]/.test(password);
    
    if (this.globalSettings.required_special_character) {
      if (!hasSpecialCharacter) {
        return { specialCharacterError: true };
      }
    }
    if (this.globalSettings.required_capital_letter) {
      const hasCapitalLetter = /[A-Z]/.test(password);
      if (!hasCapitalLetter) {
        return { capitalLetterError: true };
      }
    }

    if (this.globalSettings.required_number) {
      const hasNumber = /^\D*\d/.test(password);
      if (!hasNumber) {
        return { numberError: true };
      }
    }
    return null;
  }
}
