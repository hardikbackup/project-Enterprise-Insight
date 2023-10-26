import {
  ApplicationRef,
  Component,
  ComponentFactoryResolver,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  DefaultLabelStyle,
  GraphComponent,
  GraphEditorInputMode,
  HierarchicLayout,
  HierarchicLayoutData,
  ICanvasContext,
  ICommand,
  IEdge,
  IModelItem,
  INode,
  INodeInsetsProvider,
  INodeStyle,
  Insets,
  InteriorLabelModel,
  InteriorLabelModelPosition,
  InteriorStretchLabelModel,
  LayoutOrientation,
  License,
  NodeDefaults,
  PolylineEdgeStyle,
  PopulateItemContextMenuEventArgs,
  ShapeNodeShape,
  ShapeNodeStyle,
  Size,
  InteriorStretchLabelModelPosition,
  SvgVisual,
  MouseButtons,
  SvgExport
} from 'yfiles';

import { GraphComponentService } from './y-files/graph-component.service';
import { ContextMenuService } from './y-files/context-menu.service';
import { EventsService } from '../../../../shared/EventService';
import { environment } from '../../../../../environments/environment';
import { ViewGenerationEventService } from '../ViewGenerationEventService';
import { HelperService } from '../../../../shared/HelperService';
import NodeStyleDecoratorService from './y-files/node-style-decorator.service';
import { ModelService } from 'src/app/model/model.service';
import { AuthService } from 'src/app/auth/auth.service';
import { SettingsService } from 'src/app/administration/settings/settings.service';
import { PublicationsService } from 'src/app/publications/publications.service';

@Component({
  selector: 'app-box-view',
  templateUrl: './box-view.component.html',
  styleUrls: ['./box-view.component.css']
})
export class BoxViewComponent implements OnInit {
  @Input() viewGeneratorData: any;
  @Input() viewGeneratorGroups: any;
  @Input() groupOptions: any;
  @Input() viewGeneratorSelectedLayout: string;
  @Input() readOnly: boolean;
  @Input() publication: boolean;
  @ViewChild('graphComponentRef') graphComponentRef: ElementRef;
  @ViewChild('confirmDeleteItemsModal') confirmDeleteItemsModal: NgbModal;
  @ViewChild('hiddenId', { static: true }) hiddenElement!: ElementRef;
  @Output() objectRelationshipRemoveEvent = new EventEmitter<any>();
  @Output() svgGeneratedEvent = new EventEmitter<string>();
  viewGeneratorDataBackup: any;
  graphComponent: GraphComponent;
  graph: any;
  zoomStep: number;
  layout: any;
  deleteItems: any;
  nodeDefaultWidth: number;
  nodeDefaultHeight: number;
  labelCenterParameter: any;
  mxEditorObjectShapeDetails: any;
  settings: any;
  loggedInUser: any;
  showAttributeColorId: any;
  objectDefaultColors: any;
  showLegend: boolean;
  allObjectIds: any;
  allRelationshipIds: any;

  /**Observables*/
  viewGenerationZoomChangeSubscriber: any;
  getViewGenerationExportDiagramsSubscriber: any;
  viewGenerationLayoutChangeSubscriber: any;
  generalTabExpanded: boolean;
  defaultNoMatchColor: string;
  selectedAttribute: any;
  

  constructor(
    private eventsService: EventsService,
    private graphComponentService: GraphComponentService,
    private contextMenuService: ContextMenuService,
    private injector: Injector,
    private appRef: ApplicationRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private viewGenerationEventService: ViewGenerationEventService,
    private modalService: NgbModal,
    private helperService: HelperService,
    private modelService : ModelService,
    private authService :AuthService,
    private settingsService : SettingsService,
    private publicationService : PublicationsService
  ) {
    
    /**Zoom Change Subscriber*/
    this.viewGenerationZoomChangeSubscriber = this.viewGenerationEventService.getViewGenerationBoxZoomChangeObservable().subscribe(data => {
      switch (data) {
        case 'in':
          this.graphComponent.zoom += this.zoomStep;
          break;
        case 'out':
          this.graphComponent.zoom -= this.zoomStep;
          break;
        case 'fit':
          this.graphComponent.zoom = 1;
          this.graphComponent.fitGraphBounds();
          break;
      }
    });
    
    /**Change View Layout Subscriber*/
    this.viewGenerationLayoutChangeSubscriber = this.viewGenerationEventService.viewGenerationLayoutChangeObservable().subscribe(type => {
      this.layout.layoutOrientation = this.getLayoutType(type);

      // const defaultDesc = new PreferredPlacementDescriptor()
      // const layoutData = new HierarchicLayoutData()
      //       layoutData.edgeLabelPreferredPlacement.delegate = label => {
      //         return defaultDesc;
      //       }

      this.graph.applyLayout(this.layout, new HierarchicLayoutData());
      this.graphComponent.fitGraphBounds();
    });

    /**Export Diagrams.net Subscriber*/
    this.getViewGenerationExportDiagramsSubscriber = this.viewGenerationEventService.getViewGenerationExportDiagramsObservable().subscribe(data => {
      let groups_list = [];
      let objects_list = {};
      for (let i = 0; i < data.objects.length; i++) {
        objects_list[data.objects[i].id] = data.objects[i];
      }

      /**Collect Object Positions*/
      let shape_style = new ShapeNodeStyle();
      this.graph.nodes
        .forEach(node => {
          let provider = shape_style.renderer.getBoundsProvider(node, node.tag.node_style).getBounds(ICanvasContext.DEFAULT);
          if (node.tag.type == 'group') {
            groups_list.push({
              id: node.tag.id,
              name: node.tag.name,
              group_id: node.tag.group_id,
              parent_group_id: node.tag.parent_group_id,
              encoded_xml: node.tag.encoded_xml,
              width: provider.width,
              height: provider.height,
              top_left_x: provider.topLeft.x,
              top_left_y: provider.topLeft.y,
              type: node.tag.group_type,
              object_ids: node.tag.object_ids,
              export_attributes: node.tag.export_attributes
            });
          }
          else {
            objects_list[node.tag.id].width = provider.width;
            objects_list[node.tag.id].height = provider.height;
            objects_list[node.tag.id].top_left_x = provider.topLeft.x;
            objects_list[node.tag.id].top_left_y = provider.topLeft.y;
          }
        });

      let relationship_list = {};
      this.graph.edges
        .forEach(edge => {
          relationship_list[edge.tag.relationship_id] = [];
          let paths = IEdge.getPathPoints(edge);
          paths.forEach((item, index) => {
            relationship_list[edge.tag.relationship_id].push({
              x: item.x,
              y: item.y
            });
          })
        });

      this.viewGenerationEventService.onViewExportPositionsReceived({
        objects_list: objects_list,
        relationship_list: relationship_list,
        groups_list: groups_list
      });
    });
  }

  ngOnInit(): void {
    this.viewGeneratorDataBackup = JSON.parse(JSON.stringify(this.viewGeneratorData));
    this.loggedInUser = this.authService.getLoggedInUserObject();
    this.showAttributeColorId = '';
    this.objectDefaultColors = [];
    this.defaultNoMatchColor = '#fff';
    this.selectedAttribute = {};
    License.value = environment.yFilesLicense;
    this.zoomStep = 0.2;
    this.deleteItems = {
      objects: [],
      relationships: []
    }

    this.nodeDefaultWidth = 120;
    this.nodeDefaultHeight = 50;

    let centerLabelModel = new InteriorStretchLabelModel({ insets: 5 });
    this.labelCenterParameter = centerLabelModel.createParameter(InteriorStretchLabelModelPosition.CENTER);
    this.settingsService.getSettingsDateFormat(this.loggedInUser['login_key']).subscribe(data => {
      this.settings = data;
      this.settings.date_format = data.format;
    });

    this.generalTabExpanded = false;
    this.allObjectIds = [];
    this.allRelationshipIds = [];
    if(this.publication) {
      this.viewGeneratorDataBackup.forEach(o => {
        this.allObjectIds.push(o.id);
        if(o.relationships) {
          o.relationships.forEach(r => this.allRelationshipIds.push(r.id));
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.viewGenerationZoomChangeSubscriber) {
      this.viewGenerationZoomChangeSubscriber.unsubscribe();
    }

    if (this.getViewGenerationExportDiagramsSubscriber) {
      this.getViewGenerationExportDiagramsSubscriber.unsubscribe();
    }

    if (this.viewGenerationLayoutChangeSubscriber) {
      this.viewGenerationLayoutChangeSubscriber.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    
    this.graphComponent = this.graphComponentService.getGraphComponent();
    const div = this.graphComponent.div;
    div.style.height = '100%';

    this.graphComponentRef.nativeElement.appendChild(div);
    this.graph = this.graphComponent.graph;

    // Places the label at the top inside of the panel.
    // For group nodes, InteriorStretchLabelModel is usually the most appropriate label model
    this.graph.groupNodeDefaults.labels.layoutParameter = InteriorStretchLabelModel.NORTH

    // reserve space for the label by setting larger top insets
    this.graph.decorator.nodeDecorator.insetsProviderDecorator.setImplementationWrapper(
      (node, provider) => {
        if (this.graph.isGroupNode(node)) {
          return INodeInsetsProvider.create(() => new Insets(10, 25, 10, 10))
        }
        return provider
      }
    )

    const mode = new GraphEditorInputMode();
    mode.allowCreateNode = false;
    mode.allowCreateEdge = false;
    mode.allowAddLabel = false;
    mode.allowAdjustGroupNodeSize = false;
    mode.allowEditLabelOnDoubleClick = false;
    mode.allowUndoOperations = false;
    mode.allowReparentNodes = false;
    mode.moveInputMode.enabled = false;
    mode.allowGroupSelection = false;
    mode.allowClipboardOperations = false;
    mode.allowReverseEdge = false;
    mode.handleInputMode.enabled = false;
    // mode.keyboardInputMode.enabled = false;

    /**Do not allow delete group*/
    mode.deletablePredicate = item => {
      return !(item instanceof INode && this.graph.isGroupNode(item));
    }

    /**Click Handler*/
    mode.addItemClickedListener((src, args) => {
      
      /**Handle Edges separately*/
      if (IEdge.isInstance(args.item)) {
        this.updateSelection(this.graphComponent, args.item)
      }

      if(this.publication)  {
        if(args.mouseButtons == MouseButtons.LEFT) {
          let relId = args.item.tag.relationship_id;
          let objId = args.item.tag.id;
          if(relId || objId) {
            this.modelService.getDiagramSVGObjectShapeDetails(this.authService.getLoggedInUserObject()['login_key'],null,objId,relId,null,null).subscribe(data => {              
              this.mxEditorObjectShapeDetails = (data.status) ? data : { 'type': 'not_found' };
              // work around for attributes not showing up on first click
              this.simulateClickOnHiddenDiv();
            });
          }
        }
      }      
    })

    this.graphComponent.inputMode = mode;

    this.configureContextMenu(this.graphComponent)

    this.graph.nodeDefaults.size = new Size(this.nodeDefaultWidth, this.nodeDefaultHeight);
    this.graph.edgeDefaults.style = new PolylineEdgeStyle({
      stroke: '1.5px #484848',
      targetArrow: '#484848 small triangle'
    })

    /**Create Nodes*/
    this.createGraphNodes();
    // fit it into the view
    this.graphComponent.fitGraphBounds();

    window['data-demo-status'] = 'OK';
    if (this.graphComponent != null) {
      this.graphComponent.devicePixelRatio = window.devicePixelRatio || 1
    }


    setTimeout(() => {
      let items = document.querySelectorAll('rect');
      if (items != null) {
        for (let i=0; i<items.length; i++) {
          items[i].setAttribute('temp-id',i.toString());
          if(items[i].getAttribute('fill') === 'rgb(211,211,211)'){
            items[i].setAttribute('fill','rgb(255,255,255)')
          }
          this.objectDefaultColors.push({
            color: items[i].getAttribute('fill'),
            temp_id: i.toString()
          });
        }
      }
    },100);

    this.svgGeneratedEvent.emit(this.exportToSvg());
  }

  exportToSvg(){
    const graph = this.graphComponent;
    const exporter = new SvgExport(graph.contentRect, 0.9);
    exporter.cssStyleSheet = '';
    let svg = exporter.exportSvg(graph);
    svg.removeAttribute('style')
    return SvgExport.exportSvgString(svg);
  }
  

  addClass(e: Element, className: string): Element {
    const classes = e.getAttribute('class')
    if (classes === null || classes === '') {
      e.setAttribute('class', className)
    } else if (!this.hasClass(e, className)) {
      e.setAttribute('class', `${classes} ${className}`)
    }
    return e
  }

  removeClass(e: Element, className: string): Element {
    const classes = e.getAttribute('class')
    if (classes !== null && classes !== '') {
      if (classes === className) {
        e.setAttribute('class', '')
      } else {
        const result = classes
          .split(' ')
          .filter((s: any) => s !== className)
          .join(' ')
        e.setAttribute('class', result)
      }
    }
    return e
  }

  hasClass(e: Element, className: string): boolean {
    const classes = e.getAttribute('class') || ''
    const r = new RegExp(`\\b${className}\\b`, '')
    return r.test(classes)
  }

  toggleClass(e: Element, className: string): Element {
    if (this.hasClass(e, className)) {
      this.removeClass(e, className)
    } else {
      this.addClass(e, className)
    }
    return e
  }

  /**
   * Creates the sample graph.
   */
  createGraphNodes() {
    this.graph.clear();
    let nodes = [];
    let objects_list = {};
    let relationshipToObjectToFromObjects = [];
    let northLabelModel = new InteriorLabelModel()
    northLabelModel.createParameter(InteriorLabelModelPosition.CENTER)

    /**Listener for Node Creation to auto resize node based on it's label size*/
    // let updateNodeLayout = (sender, evt) => {
    //   const label = evt.item
    //   const node = label.owner
    //   if (!INode.isInstance(node)) {
    //     return
    //   }
    //
    //   this.graph.adjustLabelPreferredSize(label)
    //
    //   const labelSizeWithMargin = new Size(label.layout.width + 5, label.layout.height + 5)
    //   const minSize = new Size(this.nodeDefaultWidth, this.nodeDefaultHeight)
    //   const newLayout = Rect.fromCenter(node.layout.center, Size.max(minSize, labelSizeWithMargin))
    //   this.graph.setNodeLayout(node, newLayout)
    // }
    //
    // this.graph.addLabelAddedListener(updateNodeLayout)

    /**Create Nodes*/
    for (let i = 0; i < this.viewGeneratorData.length; i++) {
      let node_text_color = this.viewGeneratorData[i].shape_type_text_color ? this.viewGeneratorData[i].shape_type_text_color : '#484848';
      let node_background_color = this.viewGeneratorData[i].shape_type_color ? this.viewGeneratorData[i].shape_type_color : '#ffffff';
      let border_color = this.viewGeneratorData[i].shape_type_border_color ? this.viewGeneratorData[i].shape_type_border_color : '#000000';

      let node_shape_style = new ShapeNodeStyle({
        shape: this.viewGeneratorData[i].is_round_corners ? ShapeNodeShape.ROUND_RECTANGLE : ShapeNodeShape.RECTANGLE,
        stroke: border_color,
        fill: node_background_color,
      });

      let node = {
        style: node_shape_style,
        tag: {
          id: this.viewGeneratorData[i].id,
          text: this.viewGeneratorData[i].name,
          other_model_id: this.viewGeneratorData[i].other_model_id,
          type: 'node',
          node_style: node_shape_style
        }
      }
    
      if (this.viewGeneratorData[i].shape_icon) {
        let shape_icon = this.viewGeneratorData[i].shape_icon.indexOf('data:image/png;base64') == -1 ? '/assets/shape-icons/' + this.viewGeneratorData[i].shape_icon : this.viewGeneratorData[i].shape_icon;
        node.style = <any>(new NodeStyleDecoratorService(node.style, shape_icon));
      }

      nodes[i] = this.graph.createNode(node);
      
      this.graph.addLabel({
        owner: nodes[i],
        text: this.viewGeneratorData[i].name,
        layoutParameter: this.labelCenterParameter,
        style: new DefaultLabelStyle({
          font: '10px Roboto',
          wrapping: 'character-ellipsis',
          verticalTextAlignment: 'top',
          horizontalTextAlignment: 'center'
        })
      });


      relationshipToObjectToFromObjects.push([[this.viewGeneratorData[i].id],
        this.getAllFromRelationshipIds(this.viewGeneratorData[i].relationship_from_object_id)]);

      objects_list[this.viewGeneratorData[i].id] = nodes[i];
    }
    
    //create parent-child boxes
    for (let i = 0; i < relationshipToObjectToFromObjects.length; i++ ) {
      if(relationshipToObjectToFromObjects[i][1]) {
        relationshipToObjectToFromObjects[i][1].forEach(r => {
          this.graph.setParent(objects_list[relationshipToObjectToFromObjects[i][0]], objects_list[r]);
        })
      }
    }

      /**Create Edges*/
      for (let i = 0; i < this.viewGeneratorData.length; i++) {
        if(this.viewGeneratorData[i].relationships)  {
        let total_relationships = this.viewGeneratorData[i].relationships.length;
        if (total_relationships) {
          for (let t = 0; t < total_relationships; t++) {
            /**If object presents*/
            if (objects_list[this.viewGeneratorData[i].relationships[t].object_id]) {
              let edge = this.graph.createEdge({
                source: objects_list[this.viewGeneratorData[i].id],
                target: objects_list[this.viewGeneratorData[i].relationships[t].object_id],
                tag: {
                  relationship_id: this.viewGeneratorData[i].relationships[t].id,
                  from_object_id: this.viewGeneratorData[i].id,
                  to_object_id: this.viewGeneratorData[i].relationships[t].object_id,
                  from_object_name: objects_list[this.viewGeneratorData[i].id].tag.text,
                  to_object_name: objects_list[this.viewGeneratorData[i].relationships[t].object_id].tag.text,
                  type: 'relationship'
                }
              });

              /**Create Edge Labels*/
              if (this.viewGeneratorData[i].relationships[t].attribute_text) {
                let label_style = new DefaultLabelStyle();
                label_style.backgroundFill = 'lightgray';
                label_style.insets = [0, 2];
                let normalNodeDefaults = new NodeDefaults();
                normalNodeDefaults.labels.style = label_style;
                this.graph.addLabel(edge, this.viewGeneratorData[i].relationships[t].attribute_text, null, normalNodeDefaults.labels.getStyleInstance(edge))
              }
            }
          }
        }
      }
      }

    /**Handle Groups*/
    if (this.viewGeneratorGroups.length) {
      let groups_list_obj = {};

      /**Create Groups & Nested Objects*/
      for (let i = 0; i < this.viewGeneratorGroups.length; i++) {
        let group_background_color = '#f6f6f6';
        let group_text_color = '#000000';

        if (this.groupOptions.type == 'relationship') {
          group_background_color = this.lightenDarkenColor(this.viewGeneratorGroups[i].background_color ? this.viewGeneratorGroups[i].background_color : '#46a8d5', 25);
          group_text_color = this.viewGeneratorGroups[i].shape_type_text_color ? this.viewGeneratorGroups[i].shape_type_text_color : '#000000';
        }

        let node_shape_style = new ShapeNodeStyle({
          fill: group_background_color,
          stroke: group_text_color,
          shape: this.viewGeneratorGroups[i].is_round_corners ? ShapeNodeShape.ROUND_RECTANGLE : ShapeNodeShape.RECTANGLE,
        });
        let groupNode = this.graph.createGroupNode({
          style: node_shape_style,
          tag: {
            id: this.viewGeneratorGroups[i].id,
            name: this.viewGeneratorGroups[i].name,
            group_id: this.viewGeneratorGroups[i].group_id,
            parent_group_id: this.viewGeneratorGroups[i].parent_group_id,
            encoded_xml: this.viewGeneratorGroups[i].encoded_xml,
            type: 'group',
            group_type: this.groupOptions.type == 'relationship' ? 'object' : 'attribute',
            object_ids: this.viewGeneratorGroups[i].object_ids,
            node_style: node_shape_style,
            export_attributes: this.viewGeneratorGroups[i].export_attributes
          }
        });

        this.graph.addLabel({
          owner: groupNode,
          text: this.viewGeneratorGroups[i].name,
          style: new DefaultLabelStyle({
            horizontalTextAlignment: 'left',
            insets: [2, 5]
          })
        });

        let group_nodes = [];
        for (let t = 0; t < this.viewGeneratorGroups[i].object_ids.length; t++) {
          if (objects_list[this.viewGeneratorGroups[i].object_ids[t]]) {
            group_nodes.push(objects_list[this.viewGeneratorGroups[i].object_ids[t]]);
          }
        }

        if (group_nodes.length) {
          this.graph.groupNodes(groupNode, group_nodes);
        }

        groups_list_obj[this.viewGeneratorGroups[i].group_id] = groupNode;
      }

      /**Process parent groups*/
      for (let i = 0; i < this.viewGeneratorGroups.length; i++) {
        if (this.viewGeneratorGroups[i].parent_group_id) {
          this.graph.setParent(groups_list_obj[this.viewGeneratorGroups[i].group_id], groups_list_obj[this.viewGeneratorGroups[i].parent_group_id]);
        }
      }
    }

    /**Set Hierarchical Layout*/
    this.layout = new HierarchicLayout();
    this.layout.orthogonalRouting = true
    this.layout.recursiveGroupLayering = false
    this.layout.nodeToNodeDistance = 60;
    this.layout.integratedEdgeLabeling = true


    this.layout.layoutOrientation = this.getLayoutType(this.viewGeneratorSelectedLayout);
    this.graph.applyLayout(this.layout, new HierarchicLayoutData());
    this.graphComponent.fitGraphBounds();

    nodes.forEach(n => {

    })
    
  }

  getLayoutType(type) {
    switch (type) {
      case 'top_to_bottom':
        return LayoutOrientation.TOP_TO_BOTTOM;
        break;
      case 'left_to_right':
        return LayoutOrientation.LEFT_TO_RIGHT;
        break;
      case 'bottom_to_top':
        return LayoutOrientation.BOTTOM_TO_TOP;
        break;
      case 'right_to_left':
        return LayoutOrientation.RIGHT_TO_LEFT;
        break;
    }
  }

  lightenDarkenColor(color, percent) {
    let num = parseInt(color.replace('#', ''), 16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) + amt,
      B = (num >> 8 & 0x00FF) + amt,
      G = (num & 0x0000FF) + amt;

    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (B < 255 ? B < 1 ? 0 : B : 255) * 0x100 + (G < 255 ? G < 1 ? 0 : G : 255)).toString(16).slice(1);
  }

  /**
   * Initializes the context menu.
   * @param graphComponent The graph component to which the context menu belongs
   */
  configureContextMenu(graphComponent: GraphComponent): void {
    const inputMode = graphComponent.inputMode as GraphEditorInputMode
    // inputMode.contextMenuItems = GraphItemTypes.NODE

    // Create a context menu. In this demo, we use our sample context menu implementation but you can use any other
    // context menu widget as well. See the Context Menu demo for more details about working with context menus.
    // const contextMenu = new ContextMenu(graphComponent)
    this.contextMenuService.set(graphComponent);
    const contextMenu = this.contextMenuService;

    // Add event listeners to the various events that open the context menu. These listeners then
    // call the provided callback function which in turn asks the current ContextMenuInputMode if a
    // context menu should be shown at the current location.
    contextMenu.addOpeningEventListeners(graphComponent, location => {
      if (inputMode.contextMenuInputMode.shouldOpenMenu(graphComponent.toWorldFromPage(location))) {
        contextMenu.show(location)
      }
    })

    // Add an event listener that populates the context menu according to the hit elements, or cancels showing a menu.
    // This PopulateItemContextMenu is fired when calling the ContextMenuInputMode.shouldOpenMenu method above.
    inputMode.addPopulateItemContextMenuListener((sender, args) =>
      this.populateContextMenu(contextMenu, graphComponent, args)
    )

    // Add a listener that closes the menu when the input mode requests this
    inputMode.contextMenuInputMode.addCloseMenuListener(() => {
      contextMenu.close()
    })

    // If the context menu closes itself, for example because a menu item was clicked, we must inform the input mode
    contextMenu.onClosedCallback = () => {
      inputMode.contextMenuInputMode.menuClosed()
    }
  }

  populateContextMenu(
    contextMenu,
    graphComponent: GraphComponent,
    args: PopulateItemContextMenuEventArgs<IModelItem>
  ): void {
    // The 'showMenu' property is set to true to inform the input mode that we actually want to show a context menu
    // for this item (or more generally, the location provided by the event args).
    // If you don't want to show a context menu for some locations, set 'false' in this cases.
    args.showMenu = true

    contextMenu.clearItems()
    
    let is_node = args.item instanceof INode;
    let node = (is_node || args.item instanceof IEdge) ? args.item : null;
    if (is_node && this.graph.isGroupNode(args.item)) {
      node = null;
    }

    // If the cursor is over a node select it
    this.updateSelection(graphComponent, node)

    // Create the context menu items
    let total_selected_nodes = graphComponent.selection.selectedNodes.size;
    let total_selected_edges = graphComponent.selection.selectedEdges.size;

    if (total_selected_nodes == 1 && !total_selected_edges && node && node.tag.other_model_id) {
      contextMenu.addMenuItem('Open Model', () => {
        window.open(environment.app_url + '/model/' + node.tag.other_model_id + '/' + this.helperService.generateUniqueNum(3) + '/view', '_blank');
      });
    }

    if (total_selected_nodes > 0 || total_selected_edges) {
      if(this.readOnly != true) {
      contextMenu.addMenuItem('Delete', () => {
        this.deleteItems.objects = [];
        this.deleteItems.relationships = [];
        graphComponent.selection.selectedNodes.forEach(data => {
          this.deleteItems.objects.push(data.tag);
        });

        graphComponent.selection.selectedEdges.forEach(data => {
          this.deleteItems.relationships.push(data.tag);
        });

        this.modalService.open(this.confirmDeleteItemsModal, { size: 'sm', centered: true });
      });
    }
    }
  }


  /**
   * Helper function that updates the node selection state when the context menu is opened on a node.
   * @param graphComponent The given graphComponent
   * @param node The node or <code>null</code>.
   */
  updateSelection(graphComponent: GraphComponent, node): boolean {
    if (node === null) {
      // clear the whole selection
      graphComponent.selection.clear()
    } else {
      let is_node = node instanceof INode;
      if (is_node) {
        if (this.graph.isGroupNode(node) || graphComponent.selection.selectedNodes.isSelected(node)) {
          return false;
        }
      }
      else if (graphComponent.selection.selectedEdges.isSelected(node)) {
        return false;
      }

      // graphComponent.selection.clear()
      if (is_node) {
        graphComponent.selection.selectedNodes.setSelected(node, true)
      }
      else {
        graphComponent.selection.selectedEdges.setSelected(node, true)
      }

      graphComponent.currentItem = node
    }
  }

  onConfirmDeleteItem() {
    ICommand.DELETE.execute(null, this.graphComponent);
    this.modalService.dismissAll();
    let object_ids = [];
    for (let i = 0; i < this.deleteItems.objects.length; i++) {
      object_ids.push(this.deleteItems.objects[i].id);
    }

    let relationship_ids = [];
    for (let i = 0; i < this.deleteItems.relationships.length; i++) {
      relationship_ids.push(this.deleteItems.relationships[i].relationship_id);
    }

    this.objectRelationshipRemoveEvent.emit({ object_ids: object_ids, relationship_ids: relationship_ids });
  }

  /**
   * Creates a new node style instance that is used as the base style or decorated style for
   * the NodeStyleDecorator instances created in this demo.
   */
  newBaseStyle(): INodeStyle {
    return new ShapeNodeStyle({
      fill: '#46A8D5',
      stroke: null,
      shape: 'rectangle'
    })
  }

  getAllFromRelationshipIds(relationship_from_object_id: [string]): [string] {
    if (relationship_from_object_id) {
      return this.viewGeneratorData.filter(v => relationship_from_object_id.includes(v.id))
        .map(v => v.id);
    }
  }

  displayDateTimeFormat(date_time_item) {
    return date_time_item ? this.helperService.dateTimeFormat(date_time_item) : '-';
  }

  filterTabAttributes(attribute_ids, available_attributes) {
    return available_attributes.filter(data => attribute_ids.indexOf(data.attribute_id) != -1);
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

  onToggleGeneralTab() {
    this.generalTabExpanded = !this.generalTabExpanded;
  }

  onToggleAttributeTab(item) {
    item.collapsed = !item.collapsed;
  }

  onCloseObjectShapeDetails() {
    this.mxEditorObjectShapeDetails = null;
  }

  onShowColorOptions(attribute) {
    this.showAttributeColorId = this.showAttributeColorId == attribute.attribute_id ? '' : attribute.attribute_id;
  }

  onColorSet(ai, type) {
    this.showAttributeColorId = '';
    let colors = [
        '#f4af8a',
        '#9bc2e3',
        '#a8d095',
        '#ffd878',
        '#e98084',
        '#8883e2',
        '#80e9e6',
        '#e88ce3',
        '#e5ea9a',
        '#7ec1e5'
    ];
    
    if(type === 'obj') {
      this.publicationService.diagramColorMap(this.loggedInUser['login_key'], null, ai.attribute_id, ai.selected_value, this.allObjectIds).subscribe(data => {
        this.handleColorMapForObjects(data, colors, ai);
      });
    } else if(type === 'rel') {
      this.publicationService.relationshipColorMap(this.loggedInUser['login_key'], null, ai.attribute_id, ai.selected_value, this.allRelationshipIds).subscribe(data => {
        this.handleColorMapForRelationships(data, colors, ai);
      });
    }
    
  }
  
  handleColorMapForRelationships(data: any, colors: string[], ai: any) {
    /**Collect used colors*/
    let used_colors_set = [];

    /**Set same colors for matched relationships*/
    if (data.match_relationships.length) {
      for (let i = 0; i < data.match_relationships.length; i++) {
        if (colors.length) {
          let first_color = colors[0];
          colors.splice(0, 1);
          used_colors_set.push(first_color);
          for (let j = 0; j < data.match_relationships[i].length; j++) {
              this.graph.edges.forEach(edge => {
                if(edge.tag.relationship_id === data.match_relationships[i][j]) {
                const customEdgeStyle  = new PolylineEdgeStyle({
                  stroke: '8px '+ first_color,
                  targetArrow: first_color +' large triangle'
                })
                this.graph.setStyle(edge, customEdgeStyle);
              }
              });
          }
        }
      }
    }

    /**Set different colors for non match relationships*/
    if (colors.length && data.other_relationships) {
      for (let i = 0; i < data.other_relationships.length; i++) {
        let first_color = colors[0];
        colors.splice(0, 1);
        used_colors_set.push(first_color);
          this.graph.edges.forEach(edge => {
            if(edge.tag.relationship_id === data.other_relationships[i]) {
            const customEdgeStyle  = new PolylineEdgeStyle({
              stroke: '8px ' + first_color,
              targetArrow: first_color +' large triangle'
            })
            this.graph.setStyle(edge, customEdgeStyle);
          }
          });
      }
    }

    this.selectedAttribute = {
      attribute: ai,
      type: 'color',
      values: data.match_values,
      colors: used_colors_set
    };

    this.showLegend = true;
  }

  handleColorMapForObjects(data: any, colors: string[], ai: any) {
    /**Collect used colors*/
    let used_colors_set = [];
    let used_object_temp_ids = [];

    /**Set same colors for matched objects*/
    if (data.match_objects.length) {
      for (let i = 0; i < data.match_objects.length; i++) {
        if (colors.length) {
          let first_color = colors[0];
          colors.splice(0, 1);
          used_colors_set.push(first_color);
          for (let j = 0; j < data.match_objects[i].length; j++) {
            this.viewGeneratorData
              .forEach(d => {
                if (d.id == data.match_objects[i][j]) {
                  d.shape_type_color = first_color;
                  used_object_temp_ids.push(d.id);
                }
              });
          }
        }
      }
    }

    /**Set different colors for non match objects*/
    if (colors.length && data.other_objects) {
      for (let i = 0; i < data.other_objects.length; i++) {
        let first_color = colors[0];
        colors.splice(0, 1);
        used_colors_set.push(first_color);
        this.viewGeneratorData
          .forEach(d => {
            if (d.id == data.other_objects[i]) {
              d.shape_type_color = first_color;
              used_object_temp_ids.push(d.id);
            }
          });
      }
    }

    this.selectedAttribute = {
      attribute: ai,
      type: 'color',
      values: data.match_values,
      colors: used_colors_set
    };

    /**Set white colors that's not in set*/
    this.setNonMatchObjectsDefaultColor(used_object_temp_ids);
    this.createGraphNodes();
    this.showLegend = true;
  }

  setNonMatchObjectsDefaultColor(used_object_temp_ids) {
    this.viewGeneratorData
    .forEach(d => {
      if(used_object_temp_ids.indexOf(d.id) == -1) {
        d.shape_type_color = this.defaultNoMatchColor;
      }
    });    
  }


  onHeatmap(ai, type) {
    this.showAttributeColorId = '';
    
    if(type === 'obj') {
    let used_object_temp_ids = [];
    this.publicationService.diagramHeatMap(this.loggedInUser['login_key'], null, ai.attribute_id, ai.selected_value, this.allObjectIds).subscribe(data => {
      let heatmap_colors = [
          '#ff9e38',
          '#ffbd7f',
          '#ffdfc0',
          '#ffebdc',
          '#ffffff'
      ];

      if (data.objects.length) {
        for (let i=0; i<data.objects.length; i++) {
          for (let t=0; t<data.objects[i].length; t++) {
            this.viewGeneratorData
            .forEach(d => {
              if(d.id ==  data.objects[i][t]) {
                d.shape_type_color = heatmap_colors[i];
                used_object_temp_ids.push(d.id);
              }
            });       
          }
        }

        this.selectedAttribute = {
          attribute: ai,
          type: 'heatmap',
          values: data.match_values,
          colors: heatmap_colors
        }

        /**Set white colors that's not in set*/
        this.setNonMatchObjectsDefaultColor(used_object_temp_ids);
        this.createGraphNodes();   
        this.showLegend  = true;
      }
    });
  } else if(type === 'rel') {
    this.publicationService.relationshipHeatMap(this.loggedInUser['login_key'], null, ai.attribute_id, ai.selected_value, this.allRelationshipIds).subscribe(data => {
      let heatmap_colors = [
          '#ff9e38',
          '#ffbd7f',
          '#ffdfc0',
          '#ffebdc',
          '#ffffff'
      ];

      if (data.relationships.length) {
        for (let i=0; i<data.relationships.length; i++) {
          for (let t=0; t<data.relationships[i].length; t++) {  
            this.graph.edges.forEach(edge => {
              if(edge.tag.relationship_id === data.relationships[i][t]) {
              const customEdgeStyle  = new PolylineEdgeStyle({
                stroke: '8px '+ heatmap_colors[i],
                targetArrow: heatmap_colors[i] +' large triangle'
              })
              this.graph.setStyle(edge, customEdgeStyle);
            }
            });
          }
        }

        this.selectedAttribute = {
          attribute: ai,
          type: 'heatmap',
          values: data.match_values,
          colors: heatmap_colors
        }

        this.showLegend  = true;
      }
    });
  }
  }

  onResetColors() {
    this.showLegend = false;
    this.showAttributeColorId = '';
    this.selectedAttribute = {};
    this.viewGeneratorData = JSON.parse(JSON.stringify(this.viewGeneratorDataBackup));
    this.createGraphNodes();
  }

  private simulateClickOnHiddenDiv(): void {
    const hiddenDiv: HTMLElement = this.hiddenElement.nativeElement;

    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    });

    hiddenDiv.dispatchEvent(clickEvent);
  }

}



