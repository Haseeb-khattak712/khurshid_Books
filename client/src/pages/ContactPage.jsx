const ContactPage = () => (
  <main>
    <div className="border-b border-[var(--line)] bg-[var(--paper)] px-4 py-12 md:px-6">
      <div className="mx-auto max-w-3xl">
        <span className="label-tag">Contact</span>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-[var(--ink)]">Get in touch</h1>
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          Bulk orders, missing items, or a question about stock — we reply within a working day.
        </p>
      </div>
    </div>

    <div className="mx-auto max-w-5xl px-4 py-14 md:px-6">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="surface-raised p-8">
          <h2 className="font-serif text-xl font-semibold text-[var(--ink)]">Visit or call</h2>
          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="font-medium text-[var(--text-muted)]">Address</dt>
              <dd className="mt-1 text-[var(--ink)]">123 Stationery Lane, Anarkali, Lahore</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--text-muted)]">Email</dt>
              <dd className="mt-1 text-[var(--ink)]">support@khursheedagency.com</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--text-muted)]">Phone / WhatsApp</dt>
              <dd className="mt-1 text-[var(--ink)]">+92 300 1234567</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--text-muted)]">Hours</dt>
              <dd className="mt-1 text-[var(--ink)]">Mon – Sat, 9am – 7pm</dd>
            </div>
          </dl>
        </div>

        <div className="surface-raised p-8">
          <h2 className="font-serif text-xl font-semibold text-[var(--ink)]">Send a message</h2>
          <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Your name" className="field" />
            <input type="email" placeholder="Email address" className="field" />
            <input type="text" placeholder="Subject" className="field" />
            <textarea placeholder="How can we help?" rows="5" className="field resize-none" />
            <button type="submit" className="btn-primary w-full">Send message</button>
          </form>
        </div>
      </div>
    </div>
  </main>
);

export default ContactPage;
