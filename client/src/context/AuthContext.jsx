import { createContext, useEffect, useReducer } from 'react';
import { supabase } from '../services/supabase.js';

export const AuthStateContext = createContext();
export const AuthDispatchContext = createContext();

const initialState = {
  user: null,
  token: null,
  isLoading: true,
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
      return { ...state, user: action.payload, isLoading: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const fetchProfile = async (sessionUser, sessionToken) => {
      if (!sessionUser) {
        dispatch({ type: 'LOGOUT' });
        return;
      }
      try {
        // Wait a small moment to ensure the trigger creates the profile
        await new Promise(res => setTimeout(res, 500));
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionUser.id)
          .single();
        
        if (error) {
          // If no profile found immediately after signup, we can construct a basic one
          console.warn('Profile not found immediately:', error.message);
        }
        
        dispatch({ 
          type: 'UPDATE_USER', 
          payload: { ...sessionUser, ...(profile || {}) } 
        });
      } catch (error) {
        console.error('Error fetching profile:', error.message);
        dispatch({ type: 'LOGOUT' });
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchProfile(session?.user, session?.access_token);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchProfile(session?.user, session?.access_token);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthStateContext.Provider value={state}>
      <AuthDispatchContext.Provider value={dispatch}>{children}</AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  );
};