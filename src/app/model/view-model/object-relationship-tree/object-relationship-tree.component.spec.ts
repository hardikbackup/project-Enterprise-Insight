import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectRelationshipTreeComponent } from './object-relationship-tree.component';

describe('ObjectRelationshipTreeComponent', () => {
  let component: ObjectRelationshipTreeComponent;
  let fixture: ComponentFixture<ObjectRelationshipTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObjectRelationshipTreeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectRelationshipTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
