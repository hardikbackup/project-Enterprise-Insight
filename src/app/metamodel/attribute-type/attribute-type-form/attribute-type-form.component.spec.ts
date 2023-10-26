import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributeTypeFormComponent } from './attribute-type-form.component';

describe('AttributeTypeFormComponent', () => {
  let component: AttributeTypeFormComponent;
  let fixture: ComponentFixture<AttributeTypeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttributeTypeFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributeTypeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
