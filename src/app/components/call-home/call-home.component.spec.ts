import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallHomeComponent } from './call-home.component';

describe('CallHomeComponent', () => {
  let component: CallHomeComponent;
  let fixture: ComponentFixture<CallHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
