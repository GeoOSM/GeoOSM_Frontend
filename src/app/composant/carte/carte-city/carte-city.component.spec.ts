import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CarteCityComponent } from './carte-city.component';

describe('CarteCityComponent', () => {
  let component: CarteCityComponent;
  let fixture: ComponentFixture<CarteCityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CarteCityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CarteCityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
