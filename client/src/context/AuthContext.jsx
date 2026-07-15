import { createContext, useContext, useEffect, useReducer } from 'react';
import axios from '../services/api.js';

const AuthStateContext = createContext();
const AuthDispatchContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isLoading: false
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
      return { user: action.payload.user, token: action.payload.token, isLoading: false };
    case 'LOGOUT':
      return { user: null, token: null, isLoading: false };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    if (state.token) {
      localStorage.setItem('token', state.token);
      axios.defaults.headers.common.Authorization = `Bearer ${state.token}`;
      
      const fetchUser = async () => {
        try {
          if (!state.user) {
            const res = await axios.get('/auth/me');
            if (res.data.success) {
              dispatch({ type: 'UPDATE_USER', payload: res.data.data });
            } else {
              dispatch({ type: 'LOGOUT' });
            }
          }
        } catch (error) {
          dispatch({ type: 'LOGOUT' });
        }
      };
      fetchUser();
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common.Authorization;
    }
  }, [state.token, state.user]);

  return (
    <AuthStateContext.Provider value={state}>
      <AuthDispatchContext.Provider value={dispatch}>{children}</AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  );
};

export const useAuthState = () => useContext(AuthStateContext);
export const useAuthDispatch = () => useContext(AuthDispatchContext);
