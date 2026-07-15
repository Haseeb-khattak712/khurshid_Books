import { Truck, ShieldCheck, RefreshCcw, BadgeCheck } from 'lucide-react';

const TrustBar = () => {
  const items = [
    { icon: Truck, label: 'Free Delivery', sub: 'On orders over Rs. 2000' },
    { icon: ShieldCheck, label: 'Cash on Delivery', sub: 'Pay when you receive' },
    { icon: RefreshCcw, label: '7-Day Returns', sub: 'Easy exchange policy' },
    { icon: BadgeCheck, label: 'Genuine Products', sub: '100% authentic brands' },
  ];

  return (
    <div className="bg-[#1A2744] py-3">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-3 text-white">
                <Icon size={20} className="text-[#D4A017] shrink-0" />
                <div>
                  <p className="text-xs font-bold">{item.label}</p>
                  <p className="text-[10px] text-slate-300">{item.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrustBar;