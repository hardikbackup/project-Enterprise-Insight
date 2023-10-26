import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../auth/auth.service';
import { EventsService } from '../../shared/EventService';
import { PublicationsService } from '../publications.service';
import { UsersService } from '../../administration/users/users.service';
import { io } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { ModelService } from '../../model/model.service';

@Component({
  selector: 'app-publications-form',
  templateUrl: './publications-form.component.html',
  styleUrls: ['./publications-form.component.css']
})

export class PublicationsFormComponent implements OnInit {
  loggedInUser: any;
  form: UntypedFormGroup;
  /**User Groups*/
  userGroups: any;
  preSelectedUserGroups: any;
  selectedUserGroups: any;
  specialUserGroups: any;
  /**Models*/
  modelFolderItems: any;
  modelBrowserSocket: any;
  showPagination: boolean;
  modelsLoading: boolean;
  currentPage: number;
  modelIds: any;
  modelDefaultSort: string;
  totalPages: number;
  /**Other*/
  hasFormSubmitted: boolean;
  publicationId: string;
  firstLoad: boolean;
  isLoading: boolean;
  currentActiveTab: string;
  availableDiagrams: any;
  checkedModelItems: any;
  constructor(
      private router: Router,
      private route: ActivatedRoute,
      private authService: AuthService,
      private toastCtrl: ToastrService,
      private eventsService: EventsService,
      private publicationService: PublicationsService,
      private usersService: UsersService,
      private modelService: ModelService,
  ) { }

  ngOnInit(): void {
    /**Initialize*/
    this.userGroups = [];
    this.selectedUserGroups = [];
    this.specialUserGroups = []
    this.eventsService.onPageChange({ section : 'publication', page : 'publications' })
    this.loggedInUser = this.authService.getLoggedInUserObject();
    this.hasFormSubmitted = false;
    this.firstLoad = false;
    this.isLoading = false;
    this.currentActiveTab = 'scope';
    this.publicationId = '';
    this.currentPage = 1;
    this.modelDefaultSort = 'name_asc';
    this.modelFolderItems = [];
    this.availableDiagrams = [];
    this.checkedModelItems = [];

    /**Build Form*/
    this.form = new UntypedFormGroup({
      name: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      diagram_id: new UntypedFormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
    });

    this.route.paramMap.subscribe(paramMap => {
      if (paramMap.has('id')) {
        /**Get Object Type Details*/
        this.publicationId = paramMap.get('id');
        this.publicationService.publicationDetails(this.loggedInUser['login_key'], this.publicationId, null).subscribe(data => {
          if (data.status) {
            this.checkedModelItems = data.publication.checked_model_items;
            this.form.controls.name.patchValue(data.publication.name);
            if (data.publication.diagram_id) {
              this.form.controls.diagram_id.patchValue(data.publication.diagram_id);
              this.onDiagramSearch({ term: data.publication.diagram_name }, this.checkedModelItems)
            }
            /**User Groups*/
            for (let index = 0; index < data.publication.available_user_groups.length; index++) {
              const group = data.publication.available_user_groups[index];
              if(group.name=='Anyone' || group.name == 'All users'){
                this.specialUserGroups.push({
                  id: group.id,
                  name: group.name,
                  checked: false ,
                  specialGroup:true
                })  
                this.userGroups.push({
                  id: group.id,
                  name: group.name,
                  checked: false ,
                  specialGroup:true,
                  order: 0
                })  
              } else {
                this.userGroups.push({
                  id: group.id,
                  name: group.name,
                  checked: false ,
                  specialGroup:false,
                  order: 1
                })
              }
            }
            this.userGroups = this.userGroups.sort(function(a,b){
              return a.order- b.order ;
            })
            this.selectedUserGroups = data.publication.selected_user_groups;
            this.loadModels(this.currentPage,this.publicationId,false);
            this.firstLoad = true;
          }
          else{
            this.toastCtrl.info(data.error);
            this.router.navigateByUrl('publications');
          }
        })
      }
      else{
        this.firstLoad = true;
        /**Load User Groups*/
        this.usersService.getAvailableGroups(this.loggedInUser['login_key']).subscribe(data => {
          if (data.status) {
            /**User Groups*/
            for (let index = 0; index < data.groups.length; index++) {
              const group = data.groups[index];
              if (group.name == 'Anyone' || group.name == 'All users') {
                this.specialUserGroups.push({
                  id: group.id,
                  name: group.name,
                  checked: false,
                  specialGroup: true
                })
                this.userGroups.push({
                  id: group.id,
                  name: group.name,
                  checked: false,
                  specialGroup: true,
                  order: 0
                })
              } else {
                this.userGroups.push({
                  id: group.id,
                  name: group.name,
                  checked: false,
                  specialGroup: false,
                  order: 1
                })
              }
            }
            this.userGroups = this.userGroups.sort(function (a, b) {
              return a.order - b.order;
            })
          }
        });
        this.loadModels(this.currentPage,null,false);
      }
    });

    this.modelBrowserSocket = io(environment.editor_node_app_url,{
      query: {
        model_viewer: 'model_view_page',
        from: 'PlutoUI'
      }
    });

    this.onDiagramSearch({ term: '' });
  }

  ngOnDestroy() {
    if (this.modelBrowserSocket) {
      this.modelBrowserSocket.disconnect();
    }
  }

  onPublicationUpdate() {
    this.hasFormSubmitted = true;
    if (this.form.valid) {
      if (!this.form.value.name.toString().trim().length) {
        this.hasFormSubmitted = false;
        this.toastCtrl.info('Name is required');
        return false;
      }

      this.isLoading = true;
      let checked_model_items = this.collectCheckedModels(this.modelFolderItems, []);
      if (this.publicationId) {
        this.publicationService.updatePublication(this.loggedInUser['login_key'], this.publicationId, this.form.value.name, this.form.value.diagram_id, checked_model_items, this.selectedUserGroups, false).subscribe(data => {
          this.isLoading = false;
          if (data.status) {
            this.toastCtrl.success('Publication updated successfully');
            this.router.navigateByUrl('publications');
          }
          else {
            this.toastCtrl.error(data.error);
          }
        });
      }
      else{
        this.publicationService.addPublication(this.loggedInUser['login_key'], this.form.value.name, this.form.value.diagram_id, checked_model_items, this.selectedUserGroups).subscribe(data => {
          this.isLoading = false;
          if (data.status) {
            /**Navigate to the groups*/
            this.toastCtrl.success('Publication created successfully');
            this.router.navigateByUrl('publications');
            this.form.reset();
          }
          else {
            this.toastCtrl.error(data.error);
          }
        });
      }
      return;
    }
  }

  collectCheckedModels(items, checked_items) {
    for (let i=0; i<items.length; i++) {
      if (items[i].checked) {
        checked_items.push({
          id: items[i].id,
          type: items[i].type
        });
      }

      if (items[i].items && items[i].items.length) {
        this.collectCheckedModels(items[i].items, checked_items);
      }
    }

    return checked_items;
  }

  onTabChange(type) {
    this.currentActiveTab = type;
  }

  exportSelectedUserGroups(event) {
    this.selectedUserGroups = event;
  }

  /**Scope Tree View*/
  loadModels(page, publication_id, check_matches = true):boolean {
    if (page == 0 || (page > this.totalPages && this.totalPages !== 0)) {
      return false;
    }
    this.modelsLoading = true;
    this.modelService.getFolderModels(this.loggedInUser['login_key'],{ id: null, type: null },publication_id,this.modelDefaultSort,page).subscribe(data => {
      this.modelsLoading = false;
      this.firstLoad = true;
      this.currentPage = page;

      if (page == 1 && !check_matches) {
        this.modelIds = [];
        this.modelFolderItems = [];
      }

      if (Object.keys(this.modelFolderItems).length) {
        if (!check_matches) {
          this.modelFolderItems = this.modelFolderItems.concat(data.items)
        }
      }
      else{
        this.modelFolderItems = data.items;
      }

      for (let i in data.items) {
        if (this.modelIds.indexOf(data.items[i].id) == -1) {
          this.modelIds.push(data.items[i].id);
          if (check_matches) {
            this.modelFolderItems = this.modelFolderItems.concat(data.items[i]);
          }
        }
      }

      /**Add checked items*/
      if (this.checkedModelItems.length) {
        for (let i = 0; i < this.modelFolderItems.length; i++) {
          let match_found = this.checkedModelItems.filter(resp => resp.id == this.modelFolderItems[i].id && resp.type == this.modelFolderItems[i].type);
          if (match_found.length) {
            this.modelFolderItems[i].checked = true;
          }
        }
      }

      if (check_matches) {
        this.modelFolderItems = this.modelService.sortFolderModelsDynamically(this.modelDefaultSort, this.modelFolderItems);
      }

      if (!this.modelFolderItems.length && this.currentPage > 1) {
        this.currentPage--;
        this.loadModels(this.currentPage, null);
        return;
      }

      this.totalPages = data.pages ? data.pages : 1;
      // this.totalPages = data.total_pages;
      this.showPagination = this.totalPages > this.currentPage;

      if (check_matches) {
        // window.scroll(0,0);
      }

    })

    return false;
  }

  onDiagramSearch(event, checked_items = []){
    console.log(event)
    let checked_model_items = checked_items.length ? checked_items : this.collectCheckedModels(this.modelFolderItems, []);
    this.publicationService.diagramSearch(this.loggedInUser['login_key'], event.term, checked_model_items).subscribe(data => {
      this.availableDiagrams = data.diagrams;
    });
  }
}
