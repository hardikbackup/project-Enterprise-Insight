import { Component, HostListener, OnInit, ViewChild, Input, ElementRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../auth/auth.service';
import { PublicationsService } from '../publications.service';
import { HelperService } from '../../shared/HelperService';
import { DomSanitizer } from '@angular/platform-browser';
import { EventsService} from '../../shared/EventService';
import { ActivatedRoute, Router } from '@angular/router';
import * as SvgPanZoom from 'svg-pan-zoom';
import { ModelService } from '../../model/model.service';
import { SettingsService } from '../../administration/settings/settings.service';

@Component({
  selector: 'app-diagram-viewer',
  templateUrl: './diagram-viewer.component.html',
  styleUrls: ['./diagram-viewer.component.css']
})
export class DiagramViewerComponent implements OnInit{
  @Input() diagramId: string; 
  @Input() isDiagramZoom: boolean;
  @Input() isPublicAccess: boolean=false;
  @Input() publicationId: string;
  @Input() diagramSVG: string;
  @ViewChild('diagramSvgContainerEl') diagramSvgContainerEl: ElementRef;
  @ViewChild('objectDiagramsModal') objectDiagramsModal: NgbModal;
  loggedInUser: any;
  publication: any;
  // publicationId:string;
  publicationSettings:any;
  isLoading: boolean;
  selectedDiagramRawSVG: any;
  selectedDiagramSafeSVG: any;
  selectedDiagramSVGPaddingLeft: number;
  selectedDiagramSVGPaddingTop: number;
  mxEditorObjectShapeDetails: any;
  settings: any;
  standAlonePage: boolean;
  selectedAttribute: any;
  generalTabExpanded: boolean;
  objectDefaultColors: any;
  defaultNoMatchColor: string;

  /**Diagram SVG Properties*/
  diagramSvgPanZoom: SvgPanZoom.Instance = null;
  diagramSvgPanZoomOptions: any;
  needsToInitDiagramSvgPanZoom: boolean;
  showAttributeColorId: string;
  selectedLinkedObjectId: string;
  isLoadingObjectDiagrams: boolean;
  linkedObjectDiagrams: any;
  linkedObjectDiagramPages: number;
  currentObjectDiagramsPage: number;

  @HostListener('document:click', ['$event'])
  clicked(e) {
    /**Diagram SVG Click*/
    if (this.selectedDiagramSafeSVG) {
      let object_id = e.target.getAttribute('pluto-object-id');
      let cell_xml = e.target.getAttribute('pluto-cell-xml');
      let relationship_id = e.target.getAttribute('pluto-relationship-id');
      let relationship_type_id = e.target.getAttribute('pluto-relationship-type-id');
      if (object_id || relationship_id || relationship_type_id || cell_xml) {
        this.modelService.getDiagramSVGObjectShapeDetails(this.loggedInUser['login_key'],this.diagramId,object_id,relationship_id,relationship_type_id,cell_xml).subscribe(data => {
          this.mxEditorObjectShapeDetails = (data.status) ? data : { 'type': 'not_found' };
        });
      }
      else if (e.target.classList.contains('pub-obj-diagrams')) {
        if (e.target.getAttribute('has_more_diagrams') == 'true') {
          this.isLoadingObjectDiagrams = true;
          this.selectedLinkedObjectId = e.target.getAttribute('object_id');
          this.linkedObjectDiagrams = [];
          this.linkedObjectDiagramPages = 0;
          this.currentObjectDiagramsPage = 1;
          this.modalService.open(this.objectDiagramsModal, { windowClass: '1wider-modal 1import-diagrams', centered: true });
          this.loadObjectDiagrams(this.currentObjectDiagramsPage);
        }
        else{
          this.router.navigateByUrl('publications/diagram/' + e.target.getAttribute('diagram_id'));
        }
      }
    }

    if (!e.target.closest('.color-options')) {
      this.showAttributeColorId = '';
    }
  }

  constructor(
      private authService: AuthService,
      private toastCtrl: ToastrService,
      private eventsService: EventsService,
      private publicationService: PublicationsService,
      private modalService: NgbModal,
      private helperService: HelperService,
      private sanitizer: DomSanitizer,
      private route: ActivatedRoute,
      private router: Router,
      private modelService: ModelService,
      private settingsService: SettingsService,
  ) {
  }

  ngOnInit() {
    console.log("On init ---------------->")
    this.loggedInUser = !this.isPublicAccess ? this.authService.getLoggedInUserObject() : undefined;
    this.showAttributeColorId = '';
    this.needsToInitDiagramSvgPanZoom = false;
    this.selectedAttribute = {};
    console.log("checkng diagram Id ",this.diagramId)
    if (this.diagramId) {
      this.standAlonePage = false;
      this.selectedDiagramSVGPaddingLeft = 0;
      this.selectedDiagramSVGPaddingTop = 0;
      this.selectedDiagramRawSVG = this.diagramSVG;
      this.selectedDiagramSafeSVG = this.onRenderSafeSVG(this.diagramSVG);
      this.needsToInitDiagramSvgPanZoom = true;
      this.objectDefaultColors = [];
      this.defaultNoMatchColor = '#fff';
      this.processObjectLinkedDiagrams();
      console.log('running logic')
      setTimeout(() => {
        let items = document.querySelectorAll('rect');
        if (items != null) {
          for (let i=0; i<items.length; i++) {
            items[i].setAttribute('temp-id',i.toString());
            this.objectDefaultColors.push({
              color: items[i].getAttribute('fill'),
              temp_id: i.toString()
            });
          }
        }
      },2000)
    }
    else{
      this.standAlonePage = true;
      this.route.paramMap.subscribe(paramMap => {
        if (!paramMap.has('id')) {
          this.router.navigateByUrl('publications/viewer');
        }

        this.diagramId = paramMap.get('id');
        this.isLoading = true;
        this.publicationService.getDiagramDetails(this.loggedInUser['login_key'], this.diagramId).subscribe(data => {
          if (data.status) {
            this.selectedDiagramSVGPaddingLeft = 0;
            this.selectedDiagramSVGPaddingTop = 0;
            this.selectedDiagramSafeSVG = null;
            this.selectedDiagramRawSVG = null;
            if (data.diagram.svg) {
              this.selectedDiagramRawSVG = data.diagram.svg;
              this.selectedDiagramSafeSVG = this.onRenderSafeSVG(data.diagram.svg);
              this.needsToInitDiagramSvgPanZoom = true;
              this.processObjectLinkedDiagrams();
            }

            this.isLoading = false;
          }
          else{
            this.isLoading = false;
            this.toastCtrl.info(data.error);
            this.router.navigateByUrl('publications/viewer');
          }
        });
      });
    }
    //get publicaitons settings
    this.settingsService.getPublicationSettings(this.loggedInUser['login_key']).subscribe(data => {
      this.publicationSettings = Object.values(data.publication_settings);
    })
    if(!this.isPublicAccess) {
      this.settingsService.getSettingsDateFormat(this.loggedInUser['login_key']).subscribe(data => {
        this.settings = data;
        this.settings.date_format = data.format;
      });  
    }

    this.generalTabExpanded = false;
  }

  ngAfterViewInit() {
    if (this.needsToInitDiagramSvgPanZoom) {
      if (this.diagramSvgPanZoom) {
        this.diagramSvgPanZoom.destroy();
      }
      this.diagramSvgPanZoom = SvgPanZoom('#diagram_svg_container svg:first-child', {
        zoomEnabled: true,
        controlIconsEnabled: false,
        fit: true,
        center: true,
        panEnabled: true
      });
      this.diagramSvgPanZoom.enableDblClickZoom();
      this.needsToInitDiagramSvgPanZoom = false;
      this.diagramSvgPanZoom.zoom(0.7);

      let svg_zoom_options = this.diagramSvgPanZoom.getPan();
      this.diagramSvgPanZoomOptions = {
        svg_x: svg_zoom_options.x,
        svg_y: svg_zoom_options.y,
        document_x: this.diagramSvgContainerEl.nativeElement.clientWidth,
        document_y: this.diagramSvgContainerEl.nativeElement.clientHeight,
      };
    }
  }

  hasDiagramSVG():boolean {
    return !!(this.selectedDiagramSafeSVG && Object.keys(this.selectedDiagramSafeSVG).length);
  }

  onDiagramSVGZoom(type):boolean {
    let style_attributes;
    let zoom_pan_options = { x: 0, y:0 };
    switch (type) {
      case 'in':
        this.diagramSvgPanZoom.zoomIn();
        style_attributes = 'width:' + (this.diagramSvgContainerEl.nativeElement.clientWidth + 50) + 'px;height:' + (this.diagramSvgContainerEl.nativeElement.clientHeight + 50) + 'px';
        let zoom_in_pan_coordinates = this.diagramSvgPanZoom.getPan();
        zoom_pan_options.x = zoom_in_pan_coordinates.x + 20;
        zoom_pan_options.y = zoom_in_pan_coordinates.y + 5;
      break;
      case 'out':
        /**Do not allow to zoom out after 200px height*/
        if (this.diagramSvgContainerEl.nativeElement.clientHeight < 200) {
          return false;
        }
        this.diagramSvgPanZoom.zoomOut();
        let zoom_out_pan_coordinates = this.diagramSvgPanZoom.getPan();
            zoom_pan_options.x = zoom_out_pan_coordinates.x - 20;
            zoom_pan_options.y = zoom_out_pan_coordinates.y - 5;
        style_attributes = 'width:' + (this.diagramSvgContainerEl.nativeElement.clientWidth - 50) + 'px;height:' + (this.diagramSvgContainerEl.nativeElement.clientHeight - 50) + 'px';
      break;
      case 'reset':
        this.diagramSvgPanZoom.zoom(0.7);
        style_attributes = 'width:' + this.diagramSvgPanZoomOptions.document_x + 'px;height:' + this.diagramSvgPanZoomOptions.document_x + 'px;';
        zoom_pan_options = { x: this.diagramSvgPanZoomOptions.svg_x, y: this.diagramSvgPanZoomOptions.svg_y };
      break;
    }

    this.diagramSvgContainerEl.nativeElement.setAttribute('style',style_attributes);

    /**Center Horizontally on zoom in/out*/
    this.diagramSvgPanZoom.pan(zoom_pan_options);
    return false;
  }

  onCloseObjectShapeDetails() {
    this.mxEditorObjectShapeDetails = null;
  }

  displayDateTimeFormat(date_time_item) {
    return date_time_item ? this.helperService.dateTimeFormat(date_time_item) : '-';
  }

  renderPropertiesValue(item, render_full = false, show_blank = false) {
    let value = item.selected_value;
    if (value && value.length) {
      let property_text = '';
      switch (item.type) {
        case 'date':
          property_text = value['0'];
          let date_obj = property_text.match(/\d+/g);
          if (this.settings) {
            property_text = this.modelService.convertISODateToFormat(property_text, this.settings);
          }
        break;
        case 'date_range':
          let from_date = value['0'];
          let to_date = value['1'];
          if (this.settings) {
            if (from_date) {
              from_date = this.modelService.convertISODateToFormat(from_date, this.settings);
            }

            if (to_date) {
              to_date = this.modelService.convertISODateToFormat(to_date, this.settings);
            }
          }

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

      return (item.full_preview || render_full) ? property_text : (property_text ? property_text.substring(0,35) : '');
    }
    else {
      return show_blank ? '' : ((item.type == 'date') ? 'No Date' : '-');
    }
  }

  onRenderSafeSVG(svg) {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  onShowColorOptions(attribute) {
    this.showAttributeColorId = this.showAttributeColorId == attribute.attribute_id ? '' : attribute.attribute_id;
  }

  navigationPublications() {
    this.router.navigateByUrl('publications/viewer');
  }

  loadObjectDiagrams(page) {
    if (page == 0 || (page > this.linkedObjectDiagramPages && this.linkedObjectDiagramPages !== 0)) {
      return false;
    }

    this.isLoadingObjectDiagrams = true;
    this.publicationService.getLinkedObjectDiagrams(this.loggedInUser['login_key'], this.selectedLinkedObjectId, page).subscribe(data => {
      this.isLoadingObjectDiagrams = false;
      this.linkedObjectDiagrams = this.linkedObjectDiagrams.concat(data.diagrams);
      this.currentObjectDiagramsPage = page;
      this.linkedObjectDiagramPages = data.pages;
    })
  }

  processObjectLinkedDiagrams(){
    console.log("Checkinh user access",this.isPublicAccess)
    if(this.isPublicAccess) {
      this.publicationService.objectLinkedDiagramsPublic(this.publicationId, this.diagramId).subscribe(resp => {
        if (resp.status) {
          let object_refs = [];
          for (let i=0; i<resp.objects.length; i++) {
            let obj_el = document.querySelectorAll('[pluto-object-id="' + resp.objects[i].object_id + '"]');
            if (obj_el.length) {
              let x = parseFloat(obj_el[0].attributes["x"].nodeValue) + parseFloat(obj_el[0].attributes["width"].nodeValue);
              let y = parseFloat(obj_el[0].attributes["y"].nodeValue) + parseFloat(obj_el[0].attributes["height"].nodeValue);
              object_refs.push('<image class="pub-obj-diagrams" object_id="' + resp.objects[i].object_id + '" diagram_id="' + resp.objects[i].diagram_id +'" has_more_diagrams="' + resp.objects[i].has_more_diagrams + '" href="/assets/svgs/link-ic-black.svg" width="12" height="12" x="' + (x-15) + '" y="' + (y-15) + '"></image>')
            }
          }
  
          if (object_refs.length) {
            this.selectedDiagramRawSVG = this.selectedDiagramRawSVG.replace('</svg>',object_refs.join('') + ' </svg>')
            this.selectedDiagramSafeSVG = this.onRenderSafeSVG(this.selectedDiagramRawSVG);
            setTimeout(() => {
              this.needsToInitDiagramSvgPanZoom = true;
              this.ngAfterViewInit();
            },50)
          }
        }
      });
    } else {
      this.publicationService.objectLinkedDiagrams(this.loggedInUser['login_key'], this.diagramId).subscribe(resp => {
        if (resp.status) {
          let object_refs = [];
          for (let i=0; i<resp.objects.length; i++) {
            let obj_el = document.querySelectorAll('[pluto-object-id="' + resp.objects[i].object_id + '"]');
            if (obj_el.length) {
              let x = parseFloat(obj_el[0].attributes["x"].nodeValue) + parseFloat(obj_el[0].attributes["width"].nodeValue);
              let y = parseFloat(obj_el[0].attributes["y"].nodeValue) + parseFloat(obj_el[0].attributes["height"].nodeValue);
              object_refs.push('<image class="pub-obj-diagrams" object_id="' + resp.objects[i].object_id + '" diagram_id="' + resp.objects[i].diagram_id +'" has_more_diagrams="' + resp.objects[i].has_more_diagrams + '" href="/assets/svgs/link-ic-black.svg" width="12" height="12" x="' + (x-15) + '" y="' + (y-15) + '"></image>')
            }
          }
  
          if (object_refs.length) {
            this.selectedDiagramRawSVG = this.selectedDiagramRawSVG.replace('</svg>',object_refs.join('') + ' </svg>')
            this.selectedDiagramSafeSVG = this.onRenderSafeSVG(this.selectedDiagramRawSVG);
            setTimeout(() => {
              this.needsToInitDiagramSvgPanZoom = true;
              this.ngAfterViewInit();
            },50)
          }
        }
      });
    }
  }

  onColorSet(ai) {
    this.showAttributeColorId = '';
    let defaultColor = ['#ffffff','#ffffff',"#ffffff",'#ffffff','#ffffff']
    let colors = this.publicationSettings.length > 0 ? this.publicationSettings:defaultColor ;
    this.publicationService.diagramColorMap(this.loggedInUser['login_key'], this.diagramId, ai.attribute_id, ai.selected_value, null).subscribe(data => {
      /**Collect used colors*/
      let used_colors_set = [];
      let used_object_temp_ids = [];

      /**Set same colors for matched objects*/
      if (data.match_objects.length) {
        for (let i=0; i<data.match_objects.length; i++) {
          if (colors.length) {
            let first_color = colors[0];
            colors.splice(0, 1);
            used_colors_set.push(first_color);
            for (let j=0; j<data.match_objects[i].length; j++) {
              let found_objects = document.querySelectorAll('[pluto-object-id="' + data.match_objects[i][j] + '"]');
              if (found_objects.length) {
                for (let f=0; f<found_objects.length; f++) {
                  if (found_objects[f].localName == 'rect') {
                    found_objects[f].setAttribute('fill', first_color);
                    used_object_temp_ids.push(found_objects[f].getAttribute('temp-id'));
                  }
                }
              }
            }
          }
        }
      }

      /**Set different colors for non match objects*/
      if (colors.length && data.other_objects) {
          for (let i=0; i<data.other_objects.length; i++) {
            let first_color = colors[0];
            colors.splice(0, 1);
            let found_objects = document.querySelectorAll('[pluto-object-id="' + data.other_objects[i] + '"]');
            if (found_objects.length) {
              used_colors_set.push(first_color);
              for (let f=0; f<found_objects.length; f++) {
                if (found_objects[f].localName == 'rect') {
                  found_objects[f].setAttribute('fill', first_color);
                  used_object_temp_ids.push(found_objects[f].getAttribute('temp-id'));
                }
              }
            }
          }
      }

      if (data.match_values.length) {
        this.selectedAttribute = {
          attribute: ai,
          type: 'color',
          values: data.match_values,
          colors: colors
        }
      }

      /**Set white colors that's not in set*/
      this.setNonMatchObjectsDefaultColor(used_object_temp_ids);
    });
  }

  setNonMatchObjectsDefaultColor(used_object_temp_ids) {
    for (let i=0; i<this.objectDefaultColors.length; i++) {
      if (used_object_temp_ids.indexOf(this.objectDefaultColors[i].temp_id) == -1) {
        let found_objects = document.querySelectorAll('[temp-id="' + this.objectDefaultColors[i].temp_id + '"]');
        if (found_objects.length) {
          found_objects[0].setAttribute('fill', this.defaultNoMatchColor);
        }
      }
    }
  }

  onHeatmap(ai) {
    this.showAttributeColorId = '';
    let defaultColor = ['#ffffff','#ffffff',"#ffffff",'#ffffff','#ffffff']
    let heatmap_colors = this.publicationSettings.length > 0 ? this.publicationSettings:defaultColor ;
    let used_object_temp_ids = [];
    this.publicationService.diagramHeatMap(this.loggedInUser['login_key'], this.diagramId, ai.attribute_id, ai.selected_value, null).subscribe(data => {
      if (data.objects.length) {
        for (let i=0; i<data.objects.length; i++) {
          for (let t=0; t<data.objects[i].length; t++) {
            let found_objects = document.querySelectorAll('[pluto-object-id="' + data.objects[i][t] + '"]');
            if (found_objects.length) {
              for (let f=0; f<found_objects.length; f++) {
                if (found_objects[f].localName == 'rect') {
                  found_objects[f].setAttribute('fill', heatmap_colors[i]);
                  used_object_temp_ids.push(found_objects[f].getAttribute('temp-id'));
                }
              }
            }
          }
        }

        if (data.match_values.length) {
          this.selectedAttribute = {
            attribute: ai,
            type: 'heatmap',
            values: data.match_values,
            colors: heatmap_colors
          }
        }

        /**Set white colors that's not in set*/
        this.setNonMatchObjectsDefaultColor(used_object_temp_ids);
      }
    });
  }

  showColorMapLabels(): boolean {
    return !!Object.keys(this.selectedAttribute).length;
  }

  onToggleGeneralTab() {
    this.generalTabExpanded = !this.generalTabExpanded;
  }

  onToggleAttributeTab(item) {
    item.collapsed = !item.collapsed;
  }

  filterTabAttributes(attribute_ids, available_attributes) {
    return available_attributes.filter(data => attribute_ids.indexOf(data.attribute_id) != -1);
  }

  onResetColors() {
    this.showAttributeColorId = '';
    this.selectedAttribute = {};

    for (let i=0; i<this.objectDefaultColors.length; i++) {
      let found_objects = document.querySelectorAll('[temp-id="' + this.objectDefaultColors[i].temp_id + '"]');
      if (found_objects.length) {
        for (let f=0; f<found_objects.length; f++) {
          found_objects[f].setAttribute('fill', this.objectDefaultColors[i].color);
        }
      }
    }
  }
}


