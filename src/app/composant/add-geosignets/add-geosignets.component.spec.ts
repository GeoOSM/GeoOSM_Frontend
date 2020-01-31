import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGeosignetsComponent } from './add-geosignets.component';

describe('AddGeosignetsComponent', () => {
  let component: AddGeosignetsComponent;
  let fixture: ComponentFixture<AddGeosignetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddGeosignetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddGeosignetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
