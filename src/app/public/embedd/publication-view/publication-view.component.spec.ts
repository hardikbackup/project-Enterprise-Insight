import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicationViewComponent } from './publication-view.component';

describe('PublicationViewComponent', () => {
  let component: PublicationViewComponent;
  let fixture: ComponentFixture<PublicationViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PublicationViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicationViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
