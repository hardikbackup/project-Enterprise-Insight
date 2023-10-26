import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PublicationsService } from 'src/app/publications/publications.service';

@Component({
  selector: 'app-publication-view',
  templateUrl: './publication-view.component.html',
  styleUrls: ['./publication-view.component.css']
})
export class PublicationViewComponent {
  publication:any ;
  loggedInUser: any;
  publicationId: string;
  isLoading: boolean;
  type: string;
  viewGeneratorData: any;
  viewGeneratorGroups: any;
  viewGeneratorSelectedLayout: string;

  constructor(
    private toastCtrl: ToastrService,
    private publicationService: PublicationsService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    this.isLoading = true;
    this.route.paramMap.subscribe(paramMap => {
      this.publicationId = paramMap.get('id');
      let diagramId = paramMap.get('diagramId');
      console.log(this.publicationId)
      if (!this.publicationId || !diagramId) {
        this.router.navigateByUrl('/');
      }
      this.publication = {};
      if (this.publicationId) {
        this.publicationService.publicationEmbededDetails(this.publicationId, diagramId).subscribe(data => {
          if (data.status) {
            this.publication = data.publication;
            this.isLoading = false;
          }
          else {
            this.toastCtrl.info(data.error);
            this.router.navigateByUrl('/');
          }
        })
      }

        this.type = "diagram";
    });
  }
}
