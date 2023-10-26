import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-hierarchy-view',
  templateUrl: './hierarchy-view.component.html',
  styleUrls: ['./hierarchy-view.component.css']
})
export class HierarchyViewComponent implements OnInit {
  @Input('item') item: any;
  @Input('level') level: number;
  @Input('parentId') parentId: any;
  totalSubs: number;
  constructor(
  ) { }

  ngOnInit(): void {
    this.item.total_nested = this.viewHierarchyChild(this.item.items,0);
    this.totalSubs = this.item.items.length;
  }

  generateClassName(item) {
    if (!item.total_nested) {
      return 'col-6';
    }
  }

  viewHierarchyChild(items, count) {
    let total_subs = items.length;
    if (total_subs) {
      count += 1;
      for (let i=0; i<items.length; i++) {
        if (items[i].items.length) {
          return this.viewHierarchyChild(items[i].items,count);
        }
      }
    }

    return count;
  }

  getShapeIconImage(item) {
    return item.shape_icon.indexOf('data:image/png;base64') == -1 ? '/assets/shape-icons/' + item.shape_icon : item.shape_icon;
  }
}
