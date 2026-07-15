import { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { useCartDispatch } from './CartContext.jsx';

const WishlistStateContext = createContext();
const WishlistDispatchContext = createContext();

const initialState = {
  items: JSON.parse(localStorage.getItem('wishlistItems') || '[]')
};

const wishlistReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_WISHLIST': {
      const id = action.payload.product || action.payload._id || action.payload.id;
      const exists = state.items.find((item) => (item.product || item._id || item.id) === id);
      if (exists) return state;
      return { ...state, items: [...state.items, action.payload] };
    }
    case 'REMOVE_FROM_WISHLIST':
      return {
        ...state,
        items: state.items.filter((item) => (item.product || item._id || item.id) !== action.payload)
      };
    case 'CLEAR_WISHLIST':
      return { ...state, items: [] };
    default:
      return state;
  }
};

export const WishlistProvider = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);
  const { addToCart } = useCartDispatch(); // <-- Get helper from CartContext

  useEffect(() => {
    localStorage.setItem('wishlistItems', JSON.stringify(state.items));
  }, [state.items]);

  const addToWishlist = useCallback((product) => {
    dispatch({
      type: 'ADD_TO_WISHLIST',
      payload: {
        product: product.product || product._id || product.id,
        name: product.name,
        price: product.discountPrice ?? product.price,
        image: product.image || product.images?.[0] || '/roots.png'
      }
    });
  }, []);

  const removeFromWishlist = useCallback((productId) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
  }, []);

  const moveToCart = useCallback((item) => {
    addToCart(item); // <-- Use helper, not cartDispatch({ type: ... })
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: item.product || item._id || item.id });
  }, [addToCart]);

  const clearWishlist = useCallback(() => {
    dispatch({ type: 'CLEAR_WISHLIST' });
  }, []);

  const actions = {
    addToWishlist,
    removeFromWishlist,
    moveToCart,
    clearWishlist
  };

  return (
    <WishlistStateContext.Provider value={state}>
      <WishlistDispatchContext.Provider value={actions}>
        {children}
      </WishlistDispatchContext.Provider>
    </WishlistStateContext.Provider>
  );
};

export const useWishlistState = () => useContext(WishlistStateContext);
export const useWishlistDispatch = () => useContext(WishlistDispatchContext);