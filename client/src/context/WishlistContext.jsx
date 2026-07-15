import { createContext, useContext, useEffect, useReducer } from 'react';

const WishlistStateContext = createContext();
const WishlistDispatchContext = createContext();

const initialState = {
  items: JSON.parse(localStorage.getItem('wishlistItems') || '[]')
};

const wishlistReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_WISHLIST':
      if (state.items.some((item) => item.product === action.payload.product)) return state;
      return { ...state, items: [...state.items, action.payload] };
    case 'REMOVE_FROM_WISHLIST':
      return { ...state, items: state.items.filter((item) => item.product !== action.payload) };
    case 'SET_WISHLIST':
      return { ...state, items: action.payload };
    default:
      return state;
  }
};

export const WishlistProvider = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  useEffect(() => {
    localStorage.setItem('wishlistItems', JSON.stringify(state.items));
  }, [state.items]);

  return (
    <WishlistStateContext.Provider value={state}>
      <WishlistDispatchContext.Provider value={dispatch}>{children}</WishlistDispatchContext.Provider>
    </WishlistStateContext.Provider>
  );
};

export const useWishlistState = () => useContext(WishlistStateContext);
export const useWishlistDispatch = () => useContext(WishlistDispatchContext);
