import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataConnectorFormComponent } from './data-connector-form.component';

describe('DataConnectorFormComponent', () => {
  let component: DataConnectorFormComponent;
  let fixture: ComponentFixture<DataConnectorFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataConnectorFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataConnectorFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
