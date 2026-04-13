import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProfilePage } from './profile.page';
import { Auth } from '../../services/auth';
import { ProfileService } from '../../services/profile';

const mockUser = {
  id: '1',
  username: 'jesser',
  firstname: 'Jesse',
  lastname: 'Shop',
  email: 'jesser@example.com',
  birthday: '1998-01-01',
  phone: '1234567890',
  avatar: '',
  gender: 'other',
  role: 'user',
  createdAt: '2026-04-13T00:00:00.000Z',
};

describe('ProfilePage', () => {
  let component: ProfilePage;
  let fixture: ComponentFixture<ProfilePage>;
  const authMock = {
    getUser: jasmine.createSpy().and.resolveTo(mockUser),
  };
  const profileServiceMock = {
    getProfile: jasmine.createSpy().and.returnValue(of({ user: mockUser })),
    updateProfile: jasmine.createSpy().and.returnValue(of({ user: mockUser })),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [
        { provide: Auth, useValue: authMock },
        { provide: ProfileService, useValue: profileServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the saved profile', () => {
    expect(component.profile?.username).toBe('jesser');
  });
});
