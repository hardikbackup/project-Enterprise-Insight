import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelationshipTypeFormComponent } from './relationship-type-form.component';

describe('RelationshipTypeFormComponent', () => {
  let component: RelationshipTypeFormComponent;
  let fixture: ComponentFixture<RelationshipTypeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RelationshipTypeFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RelationshipTypeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
