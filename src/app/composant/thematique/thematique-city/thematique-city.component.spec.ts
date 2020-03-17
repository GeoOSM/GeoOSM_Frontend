import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThematiqueCityComponent } from './thematique-city.component';

describe('ThematiqueCityComponent', () => {
  let component: ThematiqueCityComponent;
  let fixture: ComponentFixture<ThematiqueCityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThematiqueCityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThematiqueCityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
