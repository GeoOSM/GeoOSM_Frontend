import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoucheCarteComponent } from './couche-carte.component';

describe('CoucheCarteComponent', () => {
  let component: CoucheCarteComponent;
  let fixture: ComponentFixture<CoucheCarteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoucheCarteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoucheCarteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
