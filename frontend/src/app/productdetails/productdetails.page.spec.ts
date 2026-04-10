import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductdetailsPage } from './productdetails.page';

describe('ProductdetailsPage', () => {
  let component: ProductdetailsPage;
  let fixture: ComponentFixture<ProductdetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductdetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
