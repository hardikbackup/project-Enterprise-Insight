import { Component, OnInit, ViewChild, ElementRef, Renderer2, AfterViewInit, AfterContentInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../../auth/auth.service';
import { PublicationsService } from '../../publications.service';
import { EventsService } from '../../../shared/EventService';
import { ActivatedRoute, Router } from '@angular/router';
import { ModelService } from 'src/app/model/model.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-publication-browse',
  templateUrl: './publication-browse.component.html',
  styleUrls: ['./publication-browse.component.css']
})
export class PublicationBrowseComponent implements OnInit  {
  @ViewChild('diagramSvgContainerEl') diagramSvgContainerEl: ElementRef;
  @ViewChild('objectDiagramsModal') objectDiagramsModal: NgbModal;
  @ViewChild('confluenceModel') confluenceModel: NgbModal;
  @ViewChild('sharepointModel') sharepointModel: NgbModal
  @ViewChild('urlModel') urlModel: NgbModal;
  @ViewChild('popoverContent') popoverContent: any;
  @ViewChild(NgbPopover) popover: any;
  loggedInUser: any;
  publication: any;
  publicationId: string;
  isLoading: boolean;
  type: string;
  viewGeneratorContainerCurrentWidth: number;
  viewGeneratorData: any;
  viewGeneratorGroups: any;
  viewGeneratorSelectedGroupOptions: any;
  viewGeneratorSelectedLayout: string;
  settings: any;
  viewLoaded: boolean;
  viewName: string;
  viewType: string;
  showEmbeddPublications = false;
  publicationEmbeddHtml = ""
  publicationEmbeddUrl = ""
  constructor(
    private authService: AuthService,
    private toastCtrl: ToastrService,
    private eventsService: EventsService,
    private publicationService: PublicationsService,
    private route: ActivatedRoute,
    private router: Router,
    private ngbModelService: NgbModal ,
    private modelService: ModelService
  ) {
  }


  ngOnInit() {
    this.isLoading = true;
    this.loggedInUser = this.authService.getLoggedInUserObject();
    this.route.paramMap.subscribe(paramMap => {

      this.publicationId = paramMap.get('id');
      let viewId = paramMap.get('viewid');
      let diagramId = paramMap.get('diagramId');
      console.log('viewid ', viewId)
      if (!this.publicationId) {
        this.router.navigateByUrl('publications/viewer');
      }
      this.publication = {};
      if (this.publicationId) {
        this.publicationService.publicationDetails(this.loggedInUser['login_key'], this.publicationId, diagramId).subscribe(data => {
          if (data.status) {
            this.publication = data.publication;
            this.isLoading = false;
            this.showEmbededBtn(this.publicationId, viewId, diagramId);
          }
          else {
            this.toastCtrl.info(data.error);
            this.router.navigateByUrl('publications/viewer');
          }
        })
      }

      if (viewId) {
        this.type = "view";
        this.viewGeneratorSelectedLayout = 'top_to_bottom';

        let params = this.generateViewGenerationFilters(viewId);
        this.viewGeneratorGroups = [];
        this.viewGeneratorData = [];
        this.modelService.getViewGeneratorData(this.loggedInUser['login_key'], params).subscribe(data => {
          if (data.status) {
            this.viewName = data.name;
            if (data.viewType == 'hierarchy') {
              this.viewType = 'hierarchy';
              let root_nodes = data.data;
              if (root_nodes.length > 1) {
                for (let i = 0; i < root_nodes.length; i++) {
                  root_nodes[i].total_items = this.calculate_total_items(data.data[i].items, 0);
                }

                root_nodes.sort(function (a, b) {
                  return a.total_items - b.total_items;
                });

                root_nodes.filter(function (data) {
                  let other_roots = root_nodes.filter(d => {
                    return d.id != data.id;
                  })

                  /**Check if duplicate found in nested hierarchy*/
                  let check_nested_match = function (items, id, matches_found) {
                    for (let i = 0; i < items.length; i++) {
                      if (items[i].id == id) {
                        matches_found++;
                      }

                      if (items[i].items.length) {
                        matches_found += check_nested_match(items[i].items, id, matches_found);
                      }
                    }
                    return matches_found;
                  }

                  let has_duplicate = check_nested_match(other_roots, data.id, 0);
                  if (has_duplicate) {
                    root_nodes = other_roots;
                  }
                });
              }

              /**Root items export attribute labels*/
              this.viewGeneratorGroups = [];
              this.viewGeneratorData = this.set_export_attribute_labels(root_nodes);

              for (let i = 0; i < this.viewGeneratorData.length; i++) {
                this.viewGeneratorData[i].first_layer_subs = this.viewGeneratorData[i].items.length;
                this.viewGeneratorData[i].total_nested = this.viewGeneratorHierarchyChild(this.viewGeneratorData[i].items, 0);
              }
              this.viewLoaded = true;
            }
            else {
              this.viewType = 'box';
              let group_data = <any>data.groups;
              for (let i = 0; i < group_data.length; i++) {
                if (group_data[i].export_attributes && group_data[i].export_attributes.length) {
                  for (let t = 0; t < group_data[i].export_attributes.length; t++) {
                    group_data[i].export_attributes[t].mx_label = this.renderPropertiesValue(group_data[i].export_attributes[t], true);
                  }
                }
              }

              this.viewGeneratorGroups = group_data;
              this.viewGeneratorData = data.data;
              this.viewGeneratorSelectedGroupOptions = data.group_options;
              this.viewLoaded = true;
            }
            this.isLoading = false;
          }
          else {
            this.toastCtrl.error(data.error);
          }
        });




      } else {
        /**Get Object Type Details*/
        this.type = "diagram";
      }
    });
    
  }
  

  navigationPublications() {
    this.router.navigateByUrl('publications/viewer');
  }

  renderPropertiesValue(item, render_full = false, show_blank = false) {
    let value = item.selected_value;
    if (value && value.length) {
      let property_text;
      switch (item.type) {
        case 'date':
          property_text = value['0'];
          break;
        case 'date_range':
          let from_date = value['0'];
          let to_date = value['1'];


          property_text = from_date + ' - ' + to_date;
          break;
        case 'boolean':
          if (value['0'] == null) {
            value['0'] = 'false';
          }

          property_text = value['0'];
          break;
        case 'multiple-list':
          property_text = value.join(', ');
          break;
        default:
          property_text = value['0'];
          break;
      }

      return (item.full_preview || render_full) ? property_text : (property_text ? property_text.substring(0, 35) : '');
    }
    else {
      if (show_blank) {
        return '';
      }
      else {
        return (item.type == 'date') ? 'No Date' : '-';
      }
    }
  }

  viewGeneratorHierarchyChild(items, count) {
    let total_subs = items.length;
    if (total_subs) {
      count += 1;
      for (let i = 0; i < items.length; i++) {
        if (items[i].items.length) {
          return this.viewGeneratorHierarchyChild(items[i].items, count);
        }
      }
    }

    return count;
  }


  set_export_attribute_labels(items) {
    for (let i = 0; i < items.length; i++) {

      if (items[i].export_attributes && items[i].export_attributes.length) {
        for (let t = 0; t < items[i].export_attributes.length; t++) {
          items[i].export_attributes[t].mx_label = this.renderPropertiesValue(items[i].export_attributes[t], true);
        }
      }

      if (items[i].items.length) {
        this.set_export_attribute_labels(items[i].items);
      }
    }

    return items;
  }


  generateViewGenerationFilters(viewId) {
    return {
      id: null,
      selected_ids: [viewId],
      selected_type: "view"
    };
  }

  calculate_total_items(items, total) {
    total += items.length;
    for (let i = 0; i < items.length; i++) {
      return this.calculate_total_items(items[i].items, total);
    }

    return total;
  }

  openConfluenceModel(){
    this.ngbModelService.open(this.confluenceModel, {size: 'lg',centered: true });
  }
  openSharepointModel(){
    this.ngbModelService.open(this.sharepointModel, { size : 'lg', centered: true });
  }
  openUrlModel(){
    this.ngbModelService.open(this.urlModel, { size : 'lg', centered: true });
  }
  onViewGeneratorDeleteItems(items) {

  }

  showEmbededBtn(publicationId:string, viewId:string, diagramId:string) {
    let selectedGroups = this.publication.selected_user_groups;
    const isExists = selectedGroups.filter(obj => obj.name == "Anyone");
    this.showEmbeddPublications = isExists.length && isExists.length > 0
    this.publicationEmbeddUrl = `${environment.app_url}/public/publications/embeded/${publicationId}/diagram/${diagramId}`
    this.publicationEmbeddHtml = `<iframe width="600" height="450" frameborder="0" scrolling="no" style="box-shadow:0 0 5px;color:#cccccc" src="${this.publicationEmbeddUrl}"></iframe>`
  }
}


