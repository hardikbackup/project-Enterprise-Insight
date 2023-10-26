import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectTypeFormComponent } from './object-type-form.component';

describe('ObjectTypeFormComponent', () => {
  let component: ObjectTypeFormComponent;
  let fixture: ComponentFixture<ObjectTypeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObjectTypeFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectTypeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
