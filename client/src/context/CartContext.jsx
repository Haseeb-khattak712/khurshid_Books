import { createContext, useContext, useEffect, useReducer, useCallback } from 'react';

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

  const addToCart = useCallback((product) => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        product: product.product || product._id,
        name: product.name,
        price: product.discountPrice ?? product.price,
        image: product.image || product.images?.[0] || '/roots.png',
        quantity: product.quantity || 1
      }
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { product: productId, quantity } }); // FIXED
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const saveShippingAddress = useCallback((address) => {
    dispatch({ type: 'SAVE_SHIPPING_ADDRESS', payload: address });
  }, []);

  const savePaymentMethod = useCallback((method) => {
    dispatch({ type: 'SAVE_PAYMENT_METHOD', payload: method });
  }, []);

  const actions = {
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    saveShippingAddress,
    savePaymentMethod
  };

  return (
    <CartStateContext.Provider value={state}>
      <CartDispatchContext.Provider value={actions}>{children}</CartDispatchContext.Provider>
    </CartStateContext.Provider>
  );
};

export const useCartState = () => useContext(CartStateContext);
export const useCartDispatch = () => useContext(CartDispatchContext);