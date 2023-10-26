import { Component, OnInit, Input } from '@angular/core';
import { HelperService } from '../../../../shared/HelperService';

@Component({
  selector: 'app-various-text',
  templateUrl: './various-text.component.html',
  styleUrls: ['./various-text.component.css']
})
export class VariousTextComponent implements OnInit {
  @Input() name: string;
  @Input() objectProperties: any;
  @Input() show: string;
  @Input() type: string;
  isVarious: boolean;
  label: string;
  constructor(
      private helperService: HelperService
  ) { }

  ngOnInit(): void {
    let items = [];
    for (let i=0; i<this.objectProperties.length; i++) {
      items.push(this.objectProperties[i][this.name])
    }

    if (items.length == 1) {
      this.isVarious = false;
      this.label = items[0];
    }
    else{
      this.isVarious = !items.every( v => v === items[0])
      this.label = this.isVarious ? 'Various' : items[0];
    }
  }

  displayLabel(item) {
    return item;
  }
}
