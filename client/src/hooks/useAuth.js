import { useContext } from 'react';
import { AuthStateContext, AuthDispatchContext } from '../context/AuthContext.jsx';

export const useAuthState = () => useContext(AuthStateContext);
export const useAuthDispatch = () => useContext(AuthDispatchContext);