import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectTypeDiagramTypeSearchComponent } from './object-type-diagram-type-search.component';

describe('ObjectTypeDiagramTypeSearchComponent', () => {
  let component: ObjectTypeDiagramTypeSearchComponent;
  let fixture: ComponentFixture<ObjectTypeDiagramTypeSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObjectTypeDiagramTypeSearchComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObjectTypeDiagramTypeSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
