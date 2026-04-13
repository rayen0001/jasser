import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { Feedbacks } from './feedback';

describe('Feedbacks', () => {
  let service: Feedbacks;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(Feedbacks);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
