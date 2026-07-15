import { createContext, useContext, useEffect, useReducer } from 'react';

const CartStateContext = createContext();
const CartDispatchContext = createContext();

const initialState = {
  items: JSON.parse(localStorage.getItem('cartItems') || '[]'),
  shippingAddress: JSON.parse(localStorage.getItem('shippingAddress') || '{}'),
  paymentMethod: localStorage.getItem('paymentMethod') || ''
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existing = state.items.find((item) => item.product === action.payload.product);
      let items;
      if (existing) {
        items = state.items.map((item) =>
          item.product === action.payload.product ? { ...item, quantity: item.quantity + action.payload.quantity } : item
        );
      } else {
        items = [...state.items, action.payload];
      }
      return { ...state, items };
    }
    case 'REMOVE_FROM_CART':
      return { ...state, items: state.items.filter((item) => item.product !== action.payload) };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map((item) =>
          item.product === action.payload.product ? { ...item, quantity: action.payload.quantity } : item
        )
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'SAVE_SHIPPING_ADDRESS':
      return { ...state, shippingAddress: action.payload };
    case 'SAVE_PAYMENT_METHOD':
      return { ...state, paymentMethod: action.payload };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(state.items));
    localStorage.setItem('shippingAddress', JSON.stringify(state.shippingAddress));
    localStorage.setItem('paymentMethod', state.paymentMethod);
  }, [state.items, state.shippingAddress, state.paymentMethod]);

  return (
    <CartStateContext.Provider value={state}>
      <CartDispatchContext.Provider value={dispatch}>{children}</CartDispatchContext.Provider>
    </CartStateContext.Provider>
  );
};

export const useCartState = () => useContext(CartStateContext);
export const useCartDispatch = () => useContext(CartDispatchContext);
