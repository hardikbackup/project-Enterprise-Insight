import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicationViewerComponent } from './publication-viewer.component';

describe('PublicationViewerComponent', () => {
  let component: PublicationViewerComponent;
  let fixture: ComponentFixture<PublicationViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PublicationViewerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicationViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
