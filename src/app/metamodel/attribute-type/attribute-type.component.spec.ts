import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributeTypeComponent } from './attribute-type.component';

describe('AttributeTypeComponent', () => {
  let component: AttributeTypeComponent;
  let fixture: ComponentFixture<AttributeTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttributeTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributeTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
