import { Component } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EventsService } from '../../shared/EventService';
import { AuthService } from '../../auth/auth.service';
import { QueriesService } from '../queries.service';
import {HelperService} from '../../shared/HelperService';

@Component({
  selector: 'app-queries-form',
  templateUrl: './queries-form.component.html',
  styleUrls: ['./queries-form.component.css']
})
export class QueriesFormComponent {
  loggedInUser: any;
  form: UntypedFormGroup;
  hasFormSubmitted: boolean;
  queryId: string;
  firstLoad: boolean;
  isLoading: boolean;
  isQueryLoading: boolean;
  queryDetails: any;
  queryResults: any;
  queryResultIds: any;
  currentPage: number;
  pages: number;
  hasReportRun: boolean;
  constructor(
      private router: Router,
      private route: ActivatedRoute,
      private authService: AuthService,
      private toastCtrl: ToastrService,
      private eventsService: EventsService,
      private queryService: QueriesService,
      private helperService: HelperService
  ) { }

  ngOnInit(): void {
    /**Initialize*/
    this.eventsService.onPageChange({ section : 'model', page : 'queries' })
    this.loggedInUser = this.authService.getLoggedInUserObject();
    this.firstLoad = false;
    this.hasFormSubmitted = false;
    this.isLoading = false;
    this.queryId = '';
    this.isQueryLoading = false;
    this.queryResults = [];
    this.queryResultIds = [];
    this.hasReportRun = false;
    this.queryDetails = {};
    /**Build Form*/
    this.form = new UntypedFormGroup({
      name: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      query: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
    });

    this.route.paramMap.subscribe(paramMap => {
      if (paramMap.has('id')) {
        /**Get Group Details*/
        this.queryId = paramMap.get('id');
        this.queryService.queryDetails(this.loggedInUser['login_key'], this.queryId).subscribe(data => {
          if (data.status) {
            this.form.controls.name.patchValue(data.query_data.name);
            this.form.controls.query.patchValue(data.query_data.query);
            this.firstLoad = true;
            this.queryDetails = data.query_data;
          }
          else{
            this.toastCtrl.error(data.error);
            this.router.navigateByUrl('queries');
          }
        });
      }

      this.loggedInUser = this.authService.getLoggedInUserObject();
    })
  }

  onQuerySave() {
    this.hasFormSubmitted = true;
    if (this.form.valid) {
      this.isLoading = true;

      /**Update Form*/
      if (this.queryId) {
        this.queryService.updateQuery(this.loggedInUser['login_key'], this.queryId, this.form.value.name, this.form.value.query, false).subscribe(data => {
          this.isLoading = false;
          if (data.status) {
            /**Navigate to users*/
            this.toastCtrl.success('Query updated successfully');
          }
          else {
            this.toastCtrl.error(data.error);
          }
        });
      }
      else{
        this.queryService.addQuery(this.loggedInUser['login_key'], this.form.value.name, this.form.value.query).subscribe(data => {
          this.isLoading = false;
          if (data.status) {
            /**Navigate to the groups*/
            this.toastCtrl.success('Query created successfully');
            this.router.navigateByUrl('queries');
            this.form.reset();
          }
          else {
            this.toastCtrl.error(data.error);
          }
        });
      }
    }
  }

  onRunQuery() {
    if (this.form.controls.query.value != null) {
      this.isLoading = true;
      this.hasReportRun = true;
      this.loadQueryResults(1);
    }
    else{
      this.toastCtrl.info('Please specify query');
    }
  }

  loadQueryResults(page) {
    if (page == 0 || (page > this.pages && this.pages !== 0)) {
      return false;
    }

    this.isQueryLoading = true;
    this.queryService.runQuery(this.loggedInUser['login_key'], this.form.controls.query.value, page).subscribe(data => {
      this.isLoading = false;
      this.isQueryLoading = false;
      if (data.status) {
        /**Append new items*/
        if (page == 1) {
          this.queryResultIds = [];
          this.queryResults = data.items;
        }
        else{
          this.queryResults = this.queryResults.concat(data.items);
        }

        this.firstLoad = true;
        this.currentPage = page;
        this.pages = data.pages;

        if (!this.queryResults.length && this.currentPage != 1) {
          this.currentPage--;
          this.loadQueryResults(this.currentPage);
          return;
        }
      }
      else{
        this.toastCtrl.error(data.error);
      }
    });
  }

  convertDateTimeFormat(date_item) {
    return this.helperService.dateTimeFormat(date_item);
  }
}
