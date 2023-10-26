import { Component, OnInit, Input, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Input() 'stand_alone_header' : boolean;
  @Input() 'show_environment' : boolean;
  @Input() 'publications_viewer': boolean;
  isEnvironmentExpanded: boolean;
  userId: string;
  adminUser: boolean;

  @HostListener('document:click', ['$event'])
  clicked(e) {
    if (!e.target.closest('.select')) {
      this.isEnvironmentExpanded = false;
    }
  }

  constructor(
      private router: Router,
      private authService : AuthService
  ) { }

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    this.adminUser = this.authService.isUserAdmin();
    this.isEnvironmentExpanded = false;
  }

  onEnvironmentExpand() {
    this.isEnvironmentExpanded = !this.isEnvironmentExpanded;
  }

  onHomePageNavigate() {
    this.router.navigateByUrl(this.publications_viewer ? '/publications/viewer' : '/dashboard');
  }
}
