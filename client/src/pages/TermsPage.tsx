import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { Seo } from '../components/ui/Seo';
import { PageHero } from '../components/site/Section';
import { COMPANY } from '../lib/company';

const sections = [
  { id: 'website-use', title: 'Use of this website' },
  { id: 'information-accuracy', title: 'Information and accuracy' },
  { id: 'quotes', title: 'Quotes and requests' },
  { id: 'training', title: 'Training registrations' },
  { id: 'products', title: 'Products and availability' },
  { id: 'no-advice', title: 'No professional advice' },
  { id: 'intellectual-property', title: 'Intellectual property' },
  { id: 'acceptable-use', title: 'Acceptable use' },
  { id: 'external-links', title: 'External links' },
  { id: 'liability', title: 'Liability' },
  { id: 'governing-law', title: 'Governing law' },
  { id: 'contact', title: 'Contact us' }
];

export function TermsPage() {
  return (
    <>
      <Seo
        title="Terms of Use"
        description="Terms governing use of the KILSTA Business & ICT Consultants website, including quotes, training registrations and product enquiries."
        path="/terms"
      />

      <PageHero
        eyebrow="Terms"
        title="Terms of use"
        description="These terms apply to your use of this website. They are not a substitute for a written service agreement, quotation or training arrangement."
      />

      <section className="bg-white py-14 sm:py-20">
        <div className="container-page grid gap-12 lg:grid-cols-[minmax(0,0.65fr)_minmax(0,1.35fr)] lg:items-start">
          <nav aria-label="On this page" className="card-surface p-5 lg:sticky lg:top-24">
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              On this page
            </h2>
            <ol className="mt-3 space-y-1.5 text-sm">
              {sections.map((section, index) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="flex gap-2 rounded px-1.5 py-1 text-slate-600 hover:bg-slate-50 hover:text-navy-900"
                  >
                    <span className="text-slate-400">{index + 1}.</span>
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
            <p className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-400">
              Last updated: 25 October 2026
            </p>
          </nav>

          <article className="prose-kilsta max-w-3xl">
            <p>
              This website is operated by {COMPANY.name} (“KILSTA”, “we”, “us”). By using the website,
              you agree to these terms. If you do not agree, please do not use the website.
            </p>

            <h2 id="website-use">1. Use of this website</h2>
            <p>
              The website provides general information about our business and ICT services, training
              and products, and allows you to send enquiries, quote requests and course registration
              interest. You may use the website for lawful purposes only.
            </p>

            <h2 id="information-accuracy">2. Information and accuracy</h2>
            <p>
              We aim to keep published information accurate and current, but service descriptions,
              course outlines, schedules and catalogue listings may change. Published information is
              general in nature and may not reflect your specific circumstances. We correct information
              when we become aware of an error, but we do not warrant that every page is complete or
              up to date at all times.
            </p>

            <h2 id="quotes">3. Quotes and requests</h2>
            <p>
              Submitting the quote form is a request for us to consider your needs. It does not create a
              contract, reserve resources, confirm a price or guarantee that we will accept the work. A
              quotation is only binding when it is issued in writing and accepted on the terms stated in
              that quotation. Scope, assumptions, exclusions, third-party costs and payment arrangements
              are confirmed in writing before work begins.
            </p>
            <p>
              Information you provide should be accurate and complete. If important information is
              withheld or later changes, our ability to deliver or quote accurately may be affected.
            </p>

            <h2 id="training">4. Training registrations</h2>
            <p>
              A course registration records your interest only. It does not confirm a place, a schedule
              or a fee. We will contact you to discuss arrangements. Fees, cancellation arrangements,
              venue, equipment and any minimum participant numbers are confirmed directly before a
              place is confirmed.
            </p>

            <h2 id="products">5. Products and availability</h2>
            <p>
              Product listings are an invitation to enquire. They do not confirm stock, final
              specifications, price, delivery time or warranty. Those details are confirmed in a written
              quotation or order confirmation. Third-party manufacturers and suppliers may change
              specifications or availability without notice.
            </p>

            <h2 id="no-advice">6. No professional advice</h2>
            <p>
              General content on this website is not legal, tax, accounting, engineering or other
              regulated professional advice. Statutory approvals, licensing, tax assessments and
              regulated certifications remain with the relevant authority or qualified professional. You
              should obtain independent advice where your circumstances require it.
            </p>

            <h2 id="intellectual-property">7. Intellectual property</h2>
            <p>
              Unless otherwise stated, the website design, text, graphics and branding are owned by or
              licensed to KILSTA. You may view and print pages for your own reference. You may not copy,
              republish or commercially exploit substantial parts of the website without our written
              permission. Client materials and third-party trademarks remain the property of their
              respective owners.
            </p>

            <h2 id="acceptable-use">8. Acceptable use</h2>
            <p>You must not:</p>
            <ul>
              <li>attempt to gain unauthorised access to the administration area or any system;</li>
              <li>submit false, misleading, abusive, unlawful or malicious content;</li>
              <li>interfere with the availability or security of the website;</li>
              <li>use automated tools to scrape or overload the service; or</li>
              <li>impersonate another person or organisation.</li>
            </ul>
            <p>
              We may restrict or block access where we reasonably believe these terms have been
              breached.
            </p>

            <h2 id="external-links">9. External links</h2>
            <p>
              The website may link to third-party sites or services, such as mapping services. We do not
              control those sites and are not responsible for their content, availability or privacy
              practices. Following an external link is at your own discretion.
            </p>

            <h2 id="liability">10. Liability</h2>
            <p>
              To the extent permitted by law, we are not liable for indirect or consequential loss arising
              from use of this website or reliance on general website content. Nothing in these terms
              excludes liability that cannot lawfully be excluded. Liability relating to a paid
              engagement is governed by the written agreement for that engagement.
            </p>

            <h2 id="governing-law">11. Governing law</h2>
            <p>
              These terms are governed by the laws of Papua New Guinea. Any dispute relating to the
              website is subject to the jurisdiction of the courts of Papua New Guinea, unless applicable
              law requires otherwise.
            </p>

            <h2 id="contact">12. Contact us</h2>
            <p>
              Questions about these terms can be sent to{' '}
              <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> or discussed by phone on{' '}
              <a href={`tel:${COMPANY.phoneHref}`}>{COMPANY.phone}</a>.
            </p>
            <div className="not-prose mt-8 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <FileText className="h-5 w-5 text-teal-600" aria-hidden="true" />
                Ready to discuss a specific engagement?
              </div>
              <Link to="/quote" className="btn-primary btn-sm">
                Request a quote
              </Link>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
