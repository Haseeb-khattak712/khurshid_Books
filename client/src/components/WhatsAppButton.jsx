import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
  // Replace this with the client's actual WhatsApp business number.
  // Format: Country code (e.g., 92 for Pakistan) followed by the number without leading zero.
  // Example: 923001234567
  const phoneNumber = '923469325825';
  const message = 'Hello Khursheed Book Agency, I need some help!';

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#25D366]/50"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={32} />

      {/* Optional Ping Animation */}
      <span className="absolute -top-1 -right-1 flex h-4 w-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
      </span>
    </a>
  );
};

export default WhatsAppButton;
