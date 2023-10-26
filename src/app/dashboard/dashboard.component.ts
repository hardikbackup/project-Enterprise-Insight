import { Component, OnInit } from '@angular/core';
import { EventsService } from '../shared/EventService';
import { AuthService } from '../auth/auth.service';
import { DashboardService } from './dashboard.service';
import { HelperService } from '../shared/HelperService';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  loggedInUser: any;
  favoriteModels: any;
  showAllFavoriteModels: boolean;
  isLoadingFavoriteModels: boolean;
  isLoadingPopularDiagrams: boolean;
  isLoadingPopularQueries: boolean;
  popularDiagrams: any;
  isLoadingPopularModels: boolean;
  popularModels: any;
  popularQueries: any;
  constructor(
      private authService: AuthService,
      private eventsService: EventsService,
      private dashboardService: DashboardService,
      private helperService: HelperService,
      private location: Location,
      private router: Router
  ) {
  }

  ngOnInit(): void {
    this.loggedInUser = this.authService.getLoggedInUserObject();
    this.showAllFavoriteModels = false;
    this.isLoadingPopularDiagrams = true;
    this.isLoadingPopularModels = true;
    this.isLoadingPopularQueries = true;
    this.eventsService.onPageChange({ section : 'dashboard', page : 'dashboard' });

    /**Load Favorite Models*/
    this.loadFavoriteModels(false);

    /**Load Popular Diagrams*/
    this.dashboardService.getPopularDiagrams(this.loggedInUser['login_key']).subscribe(data => {
      this.isLoadingPopularDiagrams = false;
      this.popularDiagrams = data.status ? data.diagrams : []
    });

    /**Load Popular Models*/
    this.dashboardService.getPopularModels(this.loggedInUser['login_key']).subscribe(data => {
      this.isLoadingPopularModels = false;
      this.popularModels = data.status ? data.models : []
    });

    /**Load Popular Queries*/
    this.dashboardService.getPopularQueries(this.loggedInUser['login_key']).subscribe(data => {
      this.isLoadingPopularQueries = false;
      this.popularQueries = data.status ? data.queries : []
    });
  }

  loadFavoriteModels(show_all){
    this.isLoadingFavoriteModels = true;
    this.dashboardService.getFavoriteModels(this.loggedInUser['login_key'],show_all).subscribe(data => {
      if (data.status) {
        this.isLoadingFavoriteModels = false;
        this.favoriteModels = data.models;
        this.showAllFavoriteModels = data.has_more_models;
      }
    });
  }

  onOpenModel(id) {
    this.router.navigateByUrl('/model/' + id + '/' + this.helperService.generateUniqueNum(3) + '/view');
  }

  onOpenDiagram(item) {
    window.open('/model/' + item.model_id + '/' + this.helperService.generateUniqueNum(3) + '/view#' + item.diagram_id, "_blank");
  }
}
