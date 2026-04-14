const testimonials = [
  {
    quote:
      "We were losing 40+ calls a month to voicemail. Salva AI answered every single one last month. Three new patients booked directly from after-hours calls we would have missed.",
    name: "Dr. Sarah Chen",
    title: "Owner, Westside Family Dental",
    location: "San Diego, CA",
    initials: "SC",
    color: "bg-blue-600",
  },
  {
    quote:
      "Setup took literally 8 minutes. I copied the code, pasted it, the widget was live. First patient chat came in at 11pm that same night — a new patient inquiry we would have lost.",
    name: "Marcus Webb",
    title: "Office Manager, Northbrook Dental Group",
    location: "Chicago, IL",
    initials: "MW",
    color: "bg-indigo-600",
  },
  {
    quote:
      "Our front desk was spending 2 hours a day answering the same 5 questions. The AI handles all of them now. Staff can actually focus on patients in the chair.",
    name: "Dr. James Patel",
    title: "Owner, Patel Orthodontics",
    location: "Phoenix, AZ",
    initials: "JP",
    color: "bg-violet-600",
  },
  {
    quote:
      "The voice AI sounds so natural that patients don't even realize they're talking to an AI. We've had parents specifically ask to speak with 'Claire' again on their next call.",
    name: "Lisa Tran",
    title: "Practice Manager, Lakeside Pediatric Dentistry",
    location: "Seattle, WA",
    initials: "LT",
    color: "bg-cyan-600",
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
