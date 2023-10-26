import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
@Component({
  selector: 'app-dual-list-box',
  templateUrl: './dual-list-box.component.html',
  styleUrls: ['./dual-list-box.component.css']
})
export class DualListBoxComponent implements OnInit {
  @Input('available_label') availableLabel: string;
  @Input('selected_label') selectedLabel: string;
  @Input('available_types') availableTypes: any;
  @Input('selected_types') selectedTypes: any;
  @Input('maxHeight') maxHeight: number;
  @Input() leftScrollbarClass: string;
  @Input() rightScrollbarClass: string;
  @Input('display-add-right-content') displayAddRightContent:boolean=false
  @Output() exportSelectedTypes = new EventEmitter<string>();
  dualLeftSelected: any;
  dualRightAvailable: any;
  dualRightSelected: any;
  maxHeightStyle:any;
  @Input('is_user_groups') isUserGroups: boolean = false;
  @Input('special_items') specialItems: any;
  specialItemsCount: number = 2;
  constructor() {
  }

  ngOnInit(): void {
    this.init();
    setTimeout(() => {
      this.exportSelectedTypes.emit(this.dualRightAvailable);
    }, 20);

    if (this.maxHeight) {
      this.maxHeightStyle = "height: 90vh !important;max-height: 90vh !important;"
    }
    
  }
  // ngOnChanges() {
  //   this.init();
  // }

  init() {
    this.dualLeftSelected = [];
    this.dualRightAvailable = [];
    this.dualRightSelected = [];
        if (this.selectedTypes && this.selectedTypes.length) {
      for (let i in this.selectedTypes) {
        this.dualRightAvailable.push(this.selectedTypes[i].id);
      }
    }
      }

  getDualBoxAvailableTypes() {
    let available_items = [];
    for (let i in this.availableTypes) {
      if (this.dualRightAvailable.indexOf(this.availableTypes[i].id) == -1) {
        available_items.push(this.availableTypes[i]);
      }
    }
    if (this.isUserGroups) {
      let isSpecialItemSelected = false;
      // console.log('special item seleced ', isSpecialItemSelected)
      let items = []
      let counter = 0;
      for (let index = 0; index < available_items.length; index++) {
        const element = available_items[index];
        if (element.specialGroup) {
          counter++
        }
        let get_index = this.dualLeftSelected.indexOf(element.id)
        if (get_index !== -1) {
          element.checked = true
          if (element.specialGroup == true) {
            isSpecialItemSelected = true;
          }
        } else {
          element.checked = false
        }
        items.push(element)
      }

      for (let index = 0; index < this.dualRightAvailable.length; index++) {
        const element = this.dualRightAvailable[index];
        let isSpecialItemExists = this.specialItems.filter(it => it.id === element);
        if (isSpecialItemExists && isSpecialItemExists.length > 0) {
          isSpecialItemSelected = true;
        }
      }

      this.specialItemsCount = counter;
      if (isSpecialItemSelected) {
        items = items.filter(it => it.specialGroup == true)
      }
      return items;
    } else {
      return available_items.sort(function (a, b) {
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      });
    }
  }

  getDualBoxSelectedTypes() {
    let available_items = [];
    for (let i in this.availableTypes) {
      if (this.dualRightAvailable.indexOf(this.availableTypes[i].id) !== -1) {
        available_items.push(this.availableTypes[i]);
      }
    }

    return available_items.sort(function (a, b) {
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });
  }

  onDualListLeftItemSelect(event, id) {
    let get_index = this.dualLeftSelected.indexOf(id);
    if (get_index == -1) {
      if (event.target.checked) {
        if (this.isUserGroups) {
          // clear previous selection of special items
          for (let index = 0; index < this.specialItems.length; index++) {
            const element = this.specialItems[index];
            if (element.id != id) {
              const otherItemIndex = this.dualLeftSelected.indexOf(element.id);
              if (otherItemIndex != -1)
                this.dualLeftSelected.splice(otherItemIndex, 1);
            }else{
              this.dualLeftSelected = [];
            }
          }
        }
        this.dualLeftSelected.push(id);
      }
    }
    else{
      this.dualLeftSelected.splice(get_index, 1);
    }
      }

  onDualListRightItemSelect(event, id) {
    let get_index = this.dualRightSelected.indexOf(id);
    if (get_index == -1) {
      if (event.target.checked) {
        this.dualRightSelected.push(id);
      }
    }
    else{
      this.dualRightSelected.splice(get_index, 1);
    }
      }

  onDualMoveItems(type) {
    let dual_unselect = false;
    if (type == 'right') {
      if (this.dualLeftSelected.length) {
        for (let i in this.dualLeftSelected) {
          if (this.dualRightAvailable.indexOf(this.dualLeftSelected[i]) == -1) {
            this.dualRightAvailable.push(this.dualLeftSelected[i]);
          }
        }

        dual_unselect = true;
      }
      this.specialItemsCount--;
    }
    else {
      if (this.dualRightSelected.length) {
        for (let i in this.dualRightSelected) {
          let right_sidebar_index = this.dualRightAvailable.indexOf(this.dualRightSelected[i])
          if (right_sidebar_index !== -1) {
            this.dualRightAvailable.splice(right_sidebar_index, 1)
          }
          dual_unselect = true;
        }
      }
      this.specialItemsCount++;
    }

    /**Unset selection*/
    if (dual_unselect) {
      this.dualLeftSelected = [];
      this.dualRightSelected = [];
      this.exportSelectedTypes.emit(this.dualRightAvailable);
    }
  }
}
