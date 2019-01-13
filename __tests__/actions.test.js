import MockAdapter from 'axios-mock-adapter';
import {
  getAllMenu, signUp, getCurrentUser, logoutUser, login,
} from '../src/actions';
import {
  GET_ALL_MENU, SIGN_UP, GET_CURRENT_USER, LOG_IN,
} from '../src/actions/types';
import axios from '../src/utils/axiosInstance';
import authUtils from '../src/utils/auth';

const axiosMock = new MockAdapter(axios, { delayResponse: 100 });
const dispatch = jest.fn();

describe('Redux actions', () => {
  afterEach(() => {
    dispatch.mockRestore();
    axiosMock.reset();
  });

  test('getAllMenu() should dispatch', async () => {
    const payload = [
      {
        id: 1,
        name: 'fufu',
        price: 200,
      },
    ];
    await axiosMock.onGet('/menu').replyOnce(200, payload);

    await getAllMenu()(dispatch);
    expect(dispatch).toBeCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({ type: GET_ALL_MENU, payload });
  });

  test('getCurrentUser', async () => {
    await axiosMock.onGet().replyOnce(200, {});
    await getCurrentUser()(dispatch);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({ type: GET_CURRENT_USER, payload: {} });
  });

  test('getCurrentUser', async () => {
    await axiosMock.onGet().replyOnce(500);
    await getCurrentUser()(dispatch);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({ type: GET_CURRENT_USER });
  });

  describe('signUp()', () => {
    const payload = { id: 1, email: 'try@m.com', token: 'fakeToken' };

    test('should dispatch with user payload', async () => {
      await axiosMock.onPost().replyOnce(201, payload);
      await signUp()(dispatch);
      expect(dispatch).toBeCalledTimes(1);
      delete payload.token;
      expect(dispatch).toHaveBeenCalledWith({ type: SIGN_UP, payload: { user: payload } });
    });

    test('logoutUser', () => {
      expect(authUtils.getToken()).toBe('fakeToken');
      logoutUser();
      expect(authUtils.getToken()).toBe('');
    });

    test('should fail to sign up', async () => {
      const error = { message: 'failed to signup user' };
      await axiosMock.onPost().replyOnce(500, error);
      await signUp()(dispatch);
      expect(dispatch).toBeCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith({ type: SIGN_UP, payload: { error } });
    });
  });

  describe('login()', () => {
    test('fail to dispatch login action', async () => {
      const error = { message: 'Invalid credentials supplied' };
      await axiosMock.onPost().replyOnce(500, error);

      await login()(dispatch);
      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith({ type: LOG_IN, payload: { error } });
    });

    test('fail to dispatch login action', async () => {
      const payload = { token: 'fakeToken' };
      await axiosMock.onPost().replyOnce(200, payload);

      await login()(dispatch);
      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith({ type: LOG_IN, payload });
    });
  });
});