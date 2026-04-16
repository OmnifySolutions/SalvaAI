// TODO: Replace with verified customer testimonials before enabling this section.
// This component is currently gated off in app/page.tsx via {false && <SocialProof />}
const testimonials = [
  {
    quote: "TODO: Add verified customer testimonial.",
    name: "TODO: Customer Name",
    title: "TODO: Role, Practice Name",
    location: "TODO: City, State",
    initials: "--",
    color: "bg-gray-400",
  },
  {
    quote: "TODO: Add verified customer testimonial.",
    name: "TODO: Customer Name",
    title: "TODO: Role, Practice Name",
    location: "TODO: City, State",
    initials: "--",
    color: "bg-gray-400",
  },
  {
    quote: "TODO: Add verified customer testimonial.",
    name: "TODO: Customer Name",
    title: "TODO: Role, Practice Name",
    location: "TODO: City, State",
    initials: "--",
    color: "bg-gray-400",
  },
  {
    quote: "TODO: Add verified customer testimonial.",
    name: "TODO: Customer Name",
    title: "TODO: Role, Practice Name",
    location: "TODO: City, State",
    initials: "--",
    color: "bg-gray-400",
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5 mb-4">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function SocialProof() {
  return (
    <section className="bg-white py-24 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">
            Practices that stopped missing patients
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Real results from dental offices that switched to Salva AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex flex-col"
            >
              <Stars />
              <p className="text-gray-700 text-sm leading-relaxed flex-1 mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-semibold shrink-0`}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.title} · {t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
