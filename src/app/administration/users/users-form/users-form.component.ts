import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { EventsService } from '../../../shared/EventService';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-users-form',
  templateUrl: './users-form.component.html',
  styleUrls: ['./users-form.component.css'],
})
export class UsersFormComponent implements OnInit {
  loggedInUser: any;
  form: UntypedFormGroup;
  hasFormSubmitted: boolean;
  groups: any;
  selectedGroups: any;
  userId: string;
  firstLoad: boolean;
  isLoading: boolean;
  constructor(
      private router: Router,
      private route: ActivatedRoute,
      private authService: AuthService,
      private toastCtrl: ToastrService,
      private eventsService: EventsService,
      private usersService: UsersService
  ) { }

  ngOnInit(): void {
    /**Initialize*/
    this.groups = [];
    this.selectedGroups = [];

    this.eventsService.onPageChange({ section : 'metamodel', page : 'users' })
    this.loggedInUser = this.authService.getLoggedInUserObject();
    this.firstLoad = false;
    this.hasFormSubmitted = false;
    this.isLoading = false;
    this.userId = '';

    /**Build Form*/
    this.form = new UntypedFormGroup({
      first_name: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      last_name: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      email: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      user_role: new UntypedFormControl(null , {
        updateOn: 'change',
        validators: [Validators.required]
      }),
    });

    this.route.paramMap.subscribe(paramMap => {
      if (paramMap.has('id')) {
        /**Get Group Details*/
        this.userId = paramMap.get('id');
        this.usersService.userDetails(this.loggedInUser['login_key'], this.userId).subscribe(data => {
          if (data.status) {
            this.form.controls.first_name.patchValue(data.user.first_name);
            this.form.controls.last_name.patchValue(data.user.last_name);
            this.form.controls.email.patchValue(data.user.email);
            this.form.controls.user_role.patchValue(data.user.user_role);
            this.groups = data.user.available_groups;
            this.selectedGroups  = data.user.selected_groups;
            this.firstLoad = true;
          }
          else{
            this.toastCtrl.error(data.error);
            this.router.navigateByUrl('users');
          }
        });

        this.form.addControl('password', new UntypedFormControl(null));
        this.form.addControl('repeat_password', new UntypedFormControl(null));
      }
      else{
        this.router.navigateByUrl('users');
      }

      this.loggedInUser = this.authService.getLoggedInUserObject();
    })
  }

  onUserSave() {
    this.hasFormSubmitted = true;
    if (this.form.valid) {
      this.isLoading = true;
      if (this.form.value.password != this.form.value.repeat_password) {
        this.isLoading = false;
        this.toastCtrl.info('Passwords do not match');
        return false;
      }

      /**Update Form*/
      this.usersService.updateUser(this.loggedInUser['login_key'], this.userId, this.form.value, this.selectedGroups, false).subscribe(data => {
        this.isLoading = false;
        if (data.status) {
          /**Navigate to users*/
          this.toastCtrl.success('User updated successfully');
        }
        else {
          this.toastCtrl.error(data.error);
        }
      });
    }
  }

  exportSelectedTypes(event) {
    /**Used timeout to avoid the console issue when sending data back on load*/
    setTimeout(() => {
      this.selectedGroups = event;
    },100);
  }
}
