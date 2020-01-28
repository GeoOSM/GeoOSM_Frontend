import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoucheEnCoursComponent } from './couche-en-cours.component';

describe('CoucheEnCoursComponent', () => {
  let component: CoucheEnCoursComponent;
  let fixture: ComponentFixture<CoucheEnCoursComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoucheEnCoursComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoucheEnCoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
