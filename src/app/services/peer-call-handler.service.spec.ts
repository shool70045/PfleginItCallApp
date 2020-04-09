import { TestBed } from '@angular/core/testing';

import { PeerCallHandlerService } from './peer-call-handler.service';

describe('PeerCallHandlerService', () => {
  let service: PeerCallHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PeerCallHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
