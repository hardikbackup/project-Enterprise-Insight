import { Component, Input, OnInit } from '@angular/core';
import { ModelService } from '../../model.service';
import { ToastrService } from 'ngx-toastr';
import {ModelEventService} from '../ModelEventService';

@Component({
  selector: 'app-object-relationship-tree',
  templateUrl: './object-relationship-tree.component.html',
  styleUrls: ['./object-relationship-tree.component.css']
})
export class ObjectRelationshipTreeComponent implements OnInit {
  currentPage: number;
  @Input() pages: number;
  @Input() parent_item: any;
  @Input() id: string;
  @Input() relationship_id: string;
  @Input() show: string;
  @Input() load: boolean;
  @Input() login_key: string;
  @Input() items: any;
  @Input() parentRelationshipID: string;
  @Input() parentRelationshipTypeID: string;
  relationshipReloadSubscriber: any;
  constructor(
      private modelService: ModelService,
      private toastCtrl: ToastrService,
      private modelEventService: ModelEventService,
  ) {
    this.relationshipReloadSubscriber = this.modelEventService.getModelViewRelationshipsReloadObservable().subscribe(data => {
      if (data.type == 'diagram') {
        this.currentPage = 1;
        this.items = [];
        this.loadObjectRelationships({ id: this.id }, true, this.currentPage);
      }
    });
  }

  ngOnInit(): void {
    this.currentPage = 1;
    if (this.load) {
      this.loadObjectRelationships({ id: this.id }, true, this.currentPage);
    }
  }

  ngOnDestroy() {
    if (this.relationshipReloadSubscriber) {
      this.relationshipReloadSubscriber.unsubscribe();
    }
  }

  public onOpenObjectItem(item) {
    item['expand_object'] = !item['expand_object'];
  }

  loadObjectRelationships(item, is_first_load = false, page):boolean {
    if (this.parentRelationshipTypeID == 'navigates_to') {
      /**Get Diagram Relationships*/
      this.modelService.getDiagramRelationships(this.login_key,item.id, page).subscribe(data => {
        if (data.status) {
          if (is_first_load) {
            this.items = data.relationships_data;
          }
          else{
            item.items = page == 1 ? data.relationships_data : (item.items ? item.items.concat(data.relationships_data) : data.relationships_data);
            item.expand = true;
          }
        }
        else{
          this.toastCtrl.error(data.error);
        }
      });
    }
    else{
      /**Load Object Relationships*/
      this.modelService.getObjectRelationships(this.login_key,item.id, page).subscribe(data => {
        if (data.status) {
          if (is_first_load) {
            this.items = data.relationships_data;
            this.pages = data.pages;
          }
          else{
            item.expand = true;
            item.items = page == 1 ? data.relationships_data : (item.items ? item.items.concat(data.relationships_data) : data.relationships_data);
          }
        }
        else{
          if (is_first_load) {
            this.items = [];
          }
          else{
            item.items = [];
          }
          this.toastCtrl.info(data.error);
        }
      });
    }
    return false;
  }

  loadObjects(item, page) {
      item.expand = true;
      if (item.relationship_type_id == 'navigates_to') {
        this.modelService.getObjectRelationshipDiagrams(this.login_key, this.id, page).subscribe(data => {
          if (data.status) {
            if (page == 1) {
              item.items = data.diagrams;
            }
            else{
              item.items = item.items ? item.items.concat(data.diagrams) : [];
            }

            item.pages = data.pages;
          }
          else{
            this.toastCtrl.info(data.error);
          }
        });
      }
      else{
        console.log(item)
        if (item.type == 'navigates_from') {
          this.modelService.getDiagramObjects(this.login_key,item.id,page).subscribe(data => {
            if (data.status) {
              item.items = (page == 1) ? data.objects_data : (item.items ? item.items.concat(data.objects_data) : data.objects_data);
            }
            else{
              this.toastCtrl.error(data.error);
            }
          });
        }
        else{
          this.modelService.getRelationshipObjects(this.login_key,item.relationship_type_id,item.relationship_id, item.type, this.id, page).subscribe(data => {
            if (data.status) {
              item.items = (page == 1) ? data.objects_data : (item.items ? item.items.concat(data.objects_data) : data.objects_data);
            }
            else{
              this.toastCtrl.error(data.error);
            }
          });
        }
      }
  }

  loadMoreItems() {
    this.currentPage += 1;
    if (this.show == 'objects') {
      this.loadObjects(this.parent_item, this.currentPage);
    }
    else{
      this.loadObjectRelationships(this.parent_item, false, this.currentPage);
    }
  }

  collapseObjects(item) {
    item.expand = false;
    item.items = [];
  }

  getNestedShowType(){
    switch (this.show) {
      case 'object-relationships':
        return 'objects';
      break;
      case 'objects':
        return 'object-relationships';
      break;
      case 'diagrams':
        return 'diagram-relationships';
      break;
      case 'diagram-relationships':
        return 'objects';
      break;
    }
  }

  getNestedId(){
    // return this.show == 'relationship' ? id : item.id;
  }
}
