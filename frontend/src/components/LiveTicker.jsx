const sessions = [
  { tag: 'LIVE', name: "Meera — Hand-thrown Ceramics", price: '₹1,240' },
  { tag: 'IN 10M', name: "Arjun — Leather Journals", price: '₹890' },
  { tag: 'LIVE', name: "Studio Noor — Block Print Textiles", price: '₹2,150' },
  { tag: 'IN 25M', name: "Devika — Silver Jewelry", price: '₹3,400' },
];

export default function LiveTicker() {
  const items = [...sessions, ...sessions];
  return (
    <div className="border-y border-border bg-white py-4 overflow-hidden whitespace-nowrap mt-10 shadow-sm">
      <div className="inline-flex animate-ticker font-sans text-sm font-medium">
        {items.map((s, i) => (
          <span key={i} className="inline-flex items-center gap-2.5 px-8 border-r border-border text-textMain">
            <span className="text-red-500 font-bold flex items-center gap-1.5">
              {s.tag === 'LIVE' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>}
              {s.tag}
            </span> 
            {s.name} 
            <span className="text-secondary font-semibold">{s.price}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
