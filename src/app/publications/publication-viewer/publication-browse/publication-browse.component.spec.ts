import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicationBrowseComponent } from './publication-browse.component';

describe('PublicationBrowseComponent', () => {
  let component: PublicationBrowseComponent;
  let fixture: ComponentFixture<PublicationBrowseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PublicationBrowseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicationBrowseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
