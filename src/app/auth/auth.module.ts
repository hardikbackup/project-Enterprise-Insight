import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { LogoutComponent } from './logout/logout.component';
import { ForgotPasswordModule } from './forgot-password/forgot-password.module';
import { RegisterModule } from './register/register.module';
import { ResetPasswordModule } from './reset-password/reset-password.module';
import { LoginModule } from './login/login.module';
import { InvitationModule } from './invitation/invitation.module';

@NgModule({
  declarations: [LogoutComponent],
  imports: [
    CommonModule,
    AuthRoutingModule,
    LoginModule,
    ForgotPasswordModule,
    RegisterModule,
    ResetPasswordModule,
    InvitationModule
  ]
})
export class AuthModule { }
