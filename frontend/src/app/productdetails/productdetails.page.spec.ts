import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProductdetailsPage } from './productdetails.page';
import { ActivatedRoute } from '@angular/router';
import { Products } from 'src/app/services/products';
import { Cart } from 'src/app/services/cart';
import { Wishlist } from 'src/app/services/wishlist';
import { Feedbacks } from 'src/app/services/feedback';
import { Auth } from 'src/app/services/auth';

const productMock = {
  _id: 'product-1',
  name: 'Test Product',
  ref: 'REF-1',
  desc: 'Description',
  price: 10,
  category: 'Category',
  stock: 5,
  remisComposerd: { enabled: false, percentage: 0 },
  images: [],
  averageRate: 4.5,
  createdAt: '2026-04-13T00:00:00.000Z',
};

describe('ProductdetailsPage', () => {
  let component: ProductdetailsPage;
  let fixture: ComponentFixture<ProductdetailsPage>;
  const routeMock = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy().and.returnValue('product-1'),
      },
    },
  };
  const productsMock = {
    getOne: jasmine.createSpy().and.returnValue(of({ product: productMock })),
  };
  const cartMock = { add: jasmine.createSpy().and.resolveTo(void 0) };
  const wishlistMock = { add: jasmine.createSpy().and.resolveTo(void 0) };
  const feedbacksMock = {
    getPerProduct: jasmine.createSpy().and.returnValue(of({ feedbacks: [] })),
    statsPerProduct: jasmine.createSpy().and.returnValue(of({ stats: { productId: 'product-1', totalFeedbacks: 0, averageRate: 0, totalHelpful: 0, totalUnhelpful: 0, distribution: { rate1: 0, rate2: 0, rate3: 0, rate4: 0, rate5: 0 } } })),
    create: jasmine.createSpy().and.returnValue(of({ feedback: { _id: 'feedback-1', productId: 'product-1', userId: { _id: 'user-1', username: 'jesser', firstname: 'Jesse', lastname: 'Shop' }, rating: 5, comment: 'Great product', helpful: 0, unhelpful: 0, createdAt: '2026-04-13T00:00:00.000Z' } })),
  };
  const authMock = {
    getUser: jasmine.createSpy().and.resolveTo({
      id: 'user-1',
      username: 'jesser',
      firstname: 'Jesse',
      lastname: 'Shop',
      email: 'jesser@example.com',
      role: 'user',
      createdAt: '2026-04-13T00:00:00.000Z',
    }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductdetailsPage],
      providers: [
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: Products, useValue: productsMock },
        { provide: Cart, useValue: cartMock },
        { provide: Wishlist, useValue: wishlistMock },
        { provide: Feedbacks, useValue: feedbacksMock },
        { provide: Auth, useValue: authMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductdetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the product', () => {
    expect(component.product?._id).toBe('product-1');
  });
});
