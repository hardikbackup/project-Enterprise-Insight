import { Component, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'pluto-app';
  @ViewChild('sessionTimeOutModel') sessionTimeOutModel: NgbModal;
  currentTimeUTC: any;
  isPopupOpened = false
  showSessionTimeOutModelLoading: boolean

  constructor(
    private router: Router,
    private modalService: NgbModal,
    private authService: AuthService
  ) {
  }

  ngOnInit() {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
    setInterval(() => {
      this.checkTokenExpiry()
    }, 5000)

    const refresh_token = (localStorage.getItem('refresh_token'));
    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        this.router.navigated = false;
        window.scrollTo(0, 0);
      }
    });
  }

  checkTokenExpiry() {
    const accessTokenExpiryStr: any = localStorage.getItem('access_token_expiry');
    if (!accessTokenExpiryStr) {
      localStorage.clear();
      return;
    }
    const accessTokenExpiry = new Date(accessTokenExpiryStr);
    const currentTime = new Date();
     const accessTokenExpiryUTC = new Date(accessTokenExpiry.toUTCString());
    this.currentTimeUTC = new Date(currentTime.toUTCString());
    const timeDifferenceInMinutes = (accessTokenExpiryUTC.getTime() - this.currentTimeUTC.getTime()) / (1000 * 60);
    if (timeDifferenceInMinutes < 0) {
      localStorage.clear();
      this.router.navigateByUrl('auth/login')
    } else if (timeDifferenceInMinutes > 0 && timeDifferenceInMinutes <= 1 && !this.isPopupOpened) {
      this.openSessionTimeOutModel();
      this.isPopupOpened = true;
      setTimeout(() => {
        localStorage.clear();
        this.close();
        this.router.navigateByUrl('auth/login')
      }, 60000)
    }
  }

  openSessionTimeOutModel() {
    this.modalService.open(this.sessionTimeOutModel, { size: 'sm', centered: true });
  }

  getRefreshToken() {
    const refresh_token = (localStorage.getItem('refresh_token'));
    this.showSessionTimeOutModelLoading = true;
    this.authService.refreshToken(refresh_token).subscribe(data => {
      localStorage.setItem('access_token', data.accessToken)
      localStorage.setItem('access_token_expiry', data.accessTokenExpiryAt)
      this.showSessionTimeOutModelLoading = false
      //  this.modalService.dismissAll()
    })
  }

  close() {
    this.modalService.dismissAll();
    this.isPopupOpened = false ;
    localStorage.clear();
    this.router.navigateByUrl('auth/login');
  }
}
