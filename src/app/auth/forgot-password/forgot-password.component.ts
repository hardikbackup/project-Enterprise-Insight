import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})

export class ForgotPasswordComponent implements OnInit {
  form: UntypedFormGroup;
  isLoading: boolean;
  constructor(
      private router: Router,
      private toastCtrl: ToastrService,
      private authService: AuthService
  ) {
  }

  ngOnInit(): void {
    if (this.authService.getLoggedInUser()) {
      this.router.navigateByUrl('/dashboard');
    }

    this.isLoading = false;
    this.form = new UntypedFormGroup({
      email: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required, Validators.email]
      })
    });
  }

  onForgotPassword(): void {
    if (this.form.valid) {
      this.isLoading = true;
      this.authService.onForgotPassword(this.form.value.email).subscribe(data => {
        this.isLoading = false;
        if (data.status) {
          this.toastCtrl.success('Please check your email for further instructions');
          this.router.navigateByUrl('/auth/login');
        }
        else {
          this.toastCtrl.error(data.error);
        }
      });
    }
    else{
      this.toastCtrl.info('Please type valid email');
    }
  }
}
