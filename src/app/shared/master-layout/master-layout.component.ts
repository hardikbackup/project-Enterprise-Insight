import { Component, OnInit, ViewChild } from '@angular/core';
import { EventsService } from '../EventService';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-master-layout',
  templateUrl: './master-layout.component.html',
  styleUrls: ['./master-layout.component.css']
})
export class MasterLayoutComponent implements OnInit {
  activeSection: string;
  activePage: string;
  hide_sidebar: boolean;
  adminUser: boolean;
  /**Subscribers*/
  pageSubscriber: any;
  @ViewChild('environmentRef') environmentRef: HTMLElement;
  constructor(
      private eventsService: EventsService,
      private authService : AuthService
  ) {
    this.pageSubscriber = this.eventsService.getPageObservable().subscribe((data) => {
        this.activeSection = data.section;
        this.activePage = data.page;
    });
  }

  ngOnInit(): void {
    this.adminUser = this.authService.isUserAdmin();
    this.hide_sidebar = false;
  }

  ngOnDestroy() {
    if (this.pageSubscriber) {
      this.pageSubscriber.unsubscribe();
    }
  }
}
