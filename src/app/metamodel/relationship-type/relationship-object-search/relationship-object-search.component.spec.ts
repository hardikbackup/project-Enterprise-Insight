import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelationshipObjectSearchComponent } from './relationship-object-search.component';

describe('RelationshipObjectSearchComponent', () => {
  let component: RelationshipObjectSearchComponent;
  let fixture: ComponentFixture<RelationshipObjectSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RelationshipObjectSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RelationshipObjectSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
