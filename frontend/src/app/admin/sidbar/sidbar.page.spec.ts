import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidbarPage } from './sidbar.page';

describe('SidbarPage', () => {
  let component: SidbarPage;
  let fixture: ComponentFixture<SidbarPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SidbarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
