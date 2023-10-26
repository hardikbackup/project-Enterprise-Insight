import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserGroupsService } from '../user-groups.service';
import { AuthService } from '../../../auth/auth.service';
import { EventsService } from '../../../shared/EventService';

@Component({
  selector: 'app-user-group-form',
  templateUrl: './user-group-form.component.html',
  styleUrls: ['./user-group-form.component.css']
})
export class UserGroupFormComponent {
  loggedInUser: any;
  form: UntypedFormGroup;
  groupId: any;
  totalGroupUsers: number;
  hasFormSubmitted: boolean;
  isLoading: boolean;
  constructor(
      private router: Router,
      private authService: AuthService,
      private toastCtrl: ToastrService,
      private groupService: UserGroupsService,
      private route: ActivatedRoute,
      private eventsService: EventsService
  ) { }

  ngOnInit(): void {
    /**Initialize*/
    this.isLoading = false;
    this.hasFormSubmitted = false;

    /**Build form*/
    this.form = new UntypedFormGroup({
      name: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      })
    });

    /**Get group details and prefill form*/
    this.eventsService.onPageChange({ section : 'administration', page : 'user-groups' })
    this.loggedInUser = this.authService.getLoggedInUserObject();

    this.route.paramMap.subscribe(paramMap => {
      if (paramMap.has('id')) {
        /**Get Group Details*/
        this.groupId = paramMap.get('id');
        if (this.groupId) {
          this.groupService.groupDetails(this.loggedInUser['login_key'], this.groupId).subscribe(data => {
            if (data.status) {
              this.totalGroupUsers = data.total_users;
              this.form.controls.name.patchValue(data.name);
            }
            else{
              this.toastCtrl.error(data.error);
            }
          });
        }
      }
    })
  }

  onGroupSave() {
    this.hasFormSubmitted = true;
    if (this.form.valid) {
      this.isLoading = true;
      if (this.groupId) {
        this.groupService.updateGroup(this.loggedInUser['login_key'], this.groupId, this.form.value.name).subscribe(data => {
          this.isLoading = false;
          if (data.status) {
            /**Navigate to the groups*/
            this.toastCtrl.success('Group updated successfully');
            this.router.navigateByUrl('administration/user-groups');
            this.form.reset();
          }
          else {
            this.toastCtrl.error(data.error);
          }
        });
      }
      else{
        this.groupService.addGroup(this.loggedInUser['login_key'], this.form.value.name).subscribe(data => {
          this.isLoading = false;
          if (data.status) {
            /**Navigate to the groups*/
            this.toastCtrl.success('Group created successfully');
            this.router.navigateByUrl('administration/user-groups');
            this.form.reset();
          }
          else {
            this.toastCtrl.error(data.error);
          }
        });
      }
    }
  }
}
