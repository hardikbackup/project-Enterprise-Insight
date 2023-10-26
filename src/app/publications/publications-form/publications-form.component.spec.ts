import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicationsFormComponent } from './publications-form.component';

describe('PublicationsFormComponent', () => {
  let component: PublicationsFormComponent;
  let fixture: ComponentFixture<PublicationsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PublicationsFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicationsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
