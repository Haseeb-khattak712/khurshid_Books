import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase.js';

const PrintInvoice = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, profiles(*)')
          .eq('id', id)
          .single();

        if (error) throw error;
        setOrder(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch order');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  useEffect(() => {
    // Automatically trigger print dialog when order is loaded
    if (!loading && order) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [loading, order]);

  if (loading) return <div className="p-10 text-center">Loading Invoice...</div>;
  if (error || !order) return <div className="p-10 text-center text-red-500">{error || 'Order not found'}</div>;

  const addr = order.shipping_address || {};

  return (
    <div className="bg-white text-black min-h-screen p-8 max-w-4xl mx-auto font-sans print:p-0 print:m-0">
      {/* Action buttons (hidden when printing) */}
      <div className="print:hidden mb-8 flex gap-4">
        <button onClick={() => window.print()} className="bg-black text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition">
          Print
        </button>
        <button onClick={() => window.close()} className="border border-gray-300 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition">
          Close Window
        </button>
      </div>

      <div className="border-2 border-black p-8 rounded-xl print:border-none print:p-0">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">Khursheed Book Agency</h1>
            <p className="text-sm text-gray-600">Urdu Bazar, Lahore, Pakistan</p>
            <p className="text-sm text-gray-600">Phone: +92 300 0000000</p>
            <p className="text-sm text-gray-600">Web: www.khursheedbookagency.com</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold mb-2">INVOICE</h2>
            <p className="text-sm font-semibold">Order ID: <span className="font-mono">{order.id.slice(-8).toUpperCase()}</span></p>
            <p className="text-sm">Date: {new Date(order.created_at).toLocaleDateString('en-PK')}</p>
            <p className="text-sm font-semibold mt-2">Payment: {order.payment_method}</p>
          </div>
        </div>

        {/* Shipping Information (Large for courier) */}
        <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-lg print:bg-transparent print:border-black print:border-2">
          <h3 className="text-xs uppercase font-bold text-gray-500 mb-3 tracking-wider">Ship To:</h3>
          <p className="text-2xl font-bold uppercase">{order.profiles?.full_name || 'Customer'}</p>
          <p className="text-lg mt-2">{addr.street}</p>
          <p className="text-lg">{addr.city}, {addr.province} {addr.postalCode}</p>
          <p className="text-lg font-bold mt-3 border-t-2 border-dashed border-gray-300 pt-3 inline-block">Phone: {addr.phone}</p>
        </div>

        {/* Order Items */}
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="py-3 px-2 font-bold uppercase text-sm">Item</th>
              <th className="py-3 px-2 font-bold uppercase text-sm text-center">Qty</th>
              <th className="py-3 px-2 font-bold uppercase text-sm text-right">Price</th>
              <th className="py-3 px-2 font-bold uppercase text-sm text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items?.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-4 px-2 font-semibold text-lg">{item.name}</td>
                <td className="py-4 px-2 text-center text-lg">{item.quantity}</td>
                <td className="py-4 px-2 text-right">Rs. {item.price.toLocaleString()}</td>
                <td className="py-4 px-2 text-right font-bold">Rs. {(item.price * item.quantity).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-lg">
              <span>Subtotal:</span>
              <span>Rs. {order.order_items?.reduce((acc, item) => acc + item.price * item.quantity, 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span>Shipping:</span>
              <span>
                {(() => {
                  const sub = order.order_items?.reduce((acc, item) => acc + item.price * item.quantity, 0);
                  return sub >= 1500 ? 'Free' : 'Rs. 150';
                })()}
              </span>
            </div>
            <div className="flex justify-between text-lg">
              <span>Tax (GST 17%):</span>
              <span>
                Rs. {(() => {
                  const sub = order.order_items?.reduce((acc, item) => acc + item.price * item.quantity, 0);
                  return Number((sub * 0.17).toFixed(2)).toLocaleString();
                })()}
              </span>
            </div>
            <div className="flex justify-between text-2xl font-bold border-t-2 border-black pt-3">
              <span>Total:</span>
              <span>Rs. {order.total_price?.toLocaleString()}</span>
            </div>
            
            {order.payment_method === 'Cash on Delivery' && (
              <div className="mt-4 p-3 border-2 border-black text-center font-bold text-xl uppercase">
                COD: Rs. {order.total_price?.toLocaleString()}
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm print:fixed print:bottom-8 print:left-0 print:right-0">
          <p>Thank you for shopping with Khursheed Book Agency!</p>
          <p>No returns without invoice. For any queries, contact our support.</p>
        </div>
      </div>
    </div>
  );
};

export default PrintInvoice;
