import { Link } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { Seo } from '../components/ui/Seo';
import { PageHero } from '../components/site/Section';
import { COMPANY } from '../lib/company';

const sections = [
  { id: 'who-we-are', title: 'Who we are' },
  { id: 'information-we-collect', title: 'Information we collect' },
  { id: 'how-we-use-information', title: 'How we use information' },
  { id: 'lawful-basis-and-consent', title: 'Consent and lawful handling' },
  { id: 'storage-and-security', title: 'Storage and security' },
  { id: 'sharing', title: 'When information is shared' },
  { id: 'retention', title: 'Retention' },
  { id: 'your-rights', title: 'Your choices and rights' },
  { id: 'cookies', title: 'Cookies and analytics' },
  { id: 'children', title: 'Children' },
  { id: 'changes', title: 'Changes to this policy' },
  { id: 'contact', title: 'Contact us' }
];

export function PrivacyPage() {
  return (
    <>
      <Seo
        title="Privacy Policy"
        description="How KILSTA Business & ICT Consultants collects, uses, stores and protects personal information submitted through this website."
        path="/privacy"
      />

      <PageHero
        eyebrow="Privacy"
        title="Privacy policy"
        description="This policy explains what information this website collects, why it is collected and the choices available to you. It applies to enquiries, quote requests, training registrations and administrative use of the site."
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
            <div className="mb-8 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-950">
              <p className="mb-0">
                <strong>Plain-language summary:</strong> we collect the details you choose to send us
                so we can respond to your enquiry, quote or training registration. We do not sell
                personal information. You can ask us about the information we hold about you using the
                contact details below.
              </p>
            </div>

            <h2 id="who-we-are">1. Who we are</h2>
            <p>
              {COMPANY.name} is a business and ICT consultancy based in Alotau, Milne Bay Province,
              Papua New Guinea. In this policy, “we”, “us” and “KILSTA” refer to {COMPANY.name}.
            </p>
            <p>
              Registered details: registration number {COMPANY.registrationNumber}; TIN{' '}
              {COMPANY.tin}. Postal address: {COMPANY.postalAddress}.
            </p>

            <h2 id="information-we-collect">2. Information we collect</h2>
            <p>We collect information you provide directly through this website, including:</p>
            <ul>
              <li>
                <strong>Quote requests:</strong> your name, optional organisation, email address,
                phone number, service category, requested service, project description, preferred
                contact method, optional budget range and preferred completion date.
              </li>
              <li>
                <strong>Contact messages:</strong> your name, email address, optional phone number and
                organisation, subject and message.
              </li>
              <li>
                <strong>Training registrations:</strong> your name, email address, phone number,
                optional organisation, course selection, optional preferred start date, optional
                message and consent.
              </li>
              <li>
                <strong>Administrative accounts:</strong> for authorised staff, authentication and
                profile details such as name and email address.
              </li>
            </ul>
            <p>
              Our servers may also record technical information needed to operate and protect the
              service, such as request identifiers, timestamps, the requested route and a hashed form
              of the connecting IP address for rate limiting and audit purposes. We do not intentionally
              log the contents of your message or full contact details in application logs.
            </p>

            <h2 id="how-we-use-information">3. How we use information</h2>
            <p>We use the information you provide to:</p>
            <ul>
              <li>respond to your enquiry, quote request or training registration;</li>
              <li>understand the scope of work and prepare a quotation where appropriate;</li>
              <li>arrange training and communicate about schedules, fees and availability;</li>
              <li>maintain records needed to manage our work and meet legal or accounting obligations;</li>
              <li>protect the website and administrative area against misuse; and</li>
              <li>improve the clarity and usefulness of our published information.</li>
            </ul>
            <p>
              We do not use your information to send unrelated marketing without your agreement. We do
              not sell personal information.
            </p>

            <h2 id="lawful-basis-and-consent">4. Consent and lawful handling</h2>
            <p>
              The website forms ask you to confirm that we may contact you and store the details you
              submit. You can withdraw that consent at any time by contacting us, although we may need
              to keep certain records where the law requires it or where a contract is being performed.
            </p>

            <h2 id="storage-and-security">5. Storage and security</h2>
            <p>
              Website submissions and administrative data are stored in a managed PostgreSQL database
              provided through Supabase. Application hosting and infrastructure providers process data
              on our behalf as service providers. Access to administrative records is restricted to
              authorised accounts and enforced on the server.
            </p>
            <p>
              We take reasonable technical and organisational steps to protect information, including
              restricted access, authenticated administration and encrypted connections. No system can
              be guaranteed completely secure. Please do not send passwords, payment card details or
              sensitive financial account information through the website forms.
            </p>

            <h2 id="sharing">6. When information is shared</h2>
            <p>We may share information with:</p>
            <ul>
              <li>
                service providers that host the website, database, email or infrastructure, strictly as
                needed to operate the service;
              </li>
              <li>
                professional advisers or authorities where required by law, regulation or a valid legal
                request; and
              </li>
              <li>
                other parties where you have specifically agreed, for example when a project requires
                coordination with a supplier.
              </li>
            </ul>
            <p>
              We do not publish client names, project details, contact information or testimonials
              without permission.
            </p>

            <h2 id="retention">7. Retention</h2>
            <p>
              We keep enquiry, quotation and registration records for as long as reasonably necessary
              to respond, manage the relationship, maintain business records and meet legal obligations.
              When information is no longer needed, we may delete or de-identify it. Some audit records
              may be retained for accountability and security purposes.
            </p>

            <h2 id="your-rights">8. Your choices and rights</h2>
            <p>
              You may ask us to confirm what personal information we hold about you, request a
              correction, or ask us to delete information that we are not required to keep. We may need
              to verify your identity before acting on a request. To make a request, contact us using
              the details below.
            </p>

            <h2 id="cookies">9. Cookies and analytics</h2>
            <p>
              The public website does not set advertising cookies. Authentication uses browser storage
              to keep an administrative session active after sign-in. The website may load fonts from a
              third-party font service; that provider may receive standard technical request
              information such as your IP address when fonts are loaded.
            </p>

            <h2 id="children">10. Children</h2>
            <p>
              The website is intended for general business and training enquiries. If a training
              registration concerns a person under 18, a parent or guardian should make the enquiry and
              provide consent.
            </p>

            <h2 id="changes">11. Changes to this policy</h2>
            <p>
              We may update this policy when our practices or the website changes. The date at the top
              of this page shows when it was last revised. Please review it when submitting new
              information.
            </p>

            <h2 id="contact">12. Contact us</h2>
            <p>
              Questions about this policy or a privacy request can be sent to{' '}
              <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> or discussed by phone on{' '}
              <a href={`tel:${COMPANY.phoneHref}`}>{COMPANY.phone}</a>.
            </p>
            <div className="not-prose mt-8 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <Lock className="h-5 w-5 text-teal-600" aria-hidden="true" />
                Need to update or remove your details?
              </div>
              <Link to="/contact" className="btn-outline btn-sm">
                <Mail className="h-4 w-4" aria-hidden="true" />
                Contact us
              </Link>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
