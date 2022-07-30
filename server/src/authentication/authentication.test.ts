import config from '../config';
import { sign, authenticateToken } from './authentication';

describe('Authentication', () => {
  let OLD_ENV = process.env;
  beforeAll(() => {
    config;
  });
  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...OLD_ENV }; // Make a copy
  });

  describe('sign', () => {
    test('No access token set', () => {
      delete process.env.ACCESS_TOKEN_SECRET;
      expect(()=>sign('Dummy text')).toThrow();
    });
    test('Standard data', () => {
      const tokenObject = sign('Dummy text'); 
      expect (tokenObject).toHaveProperty("accessToken");;
      expect(typeof tokenObject.accessToken).toEqual("string");
    });
  });
});
