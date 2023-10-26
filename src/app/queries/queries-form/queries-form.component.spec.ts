import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueriesFormComponent } from './queries-form.component';

describe('QueriesFormComponent', () => {
  let component: QueriesFormComponent;
  let fixture: ComponentFixture<QueriesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QueriesFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QueriesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
