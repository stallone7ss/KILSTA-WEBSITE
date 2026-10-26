-- =============================================================================
-- KILSTA seed data
--
-- Safe to run more than once: inserts use ON CONFLICT DO NOTHING and never
-- overwrite records edited in the admin dashboard.
--
-- Honesty rules applied here:
--   * Services and courses are the offerings described by KILSTA.
--   * Prices and durations are unknown, so they are NULL and displayed as
--     "on request" rather than invented.
--   * Portfolio and product sample rows are marked is_sample = true AND
--     published = false. They are visible only in the admin dashboard and are
--     excluded from the public API until an administrator reviews and enables
--     them. No real clients, projects or testimonials are fabricated.
--   * No staff profiles are seeded because no staff details were supplied.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Site settings
-- -----------------------------------------------------------------------------
insert into public.site_settings (key, value, description)
values
  (
    'company_profile',
    jsonb_build_object(
      'name', 'KILSTA Business & ICT Consultants',
      'shortName', 'KILSTA',
      'tagline', 'Business and ICT solutions for Papua New Guinea',
      'email', 'kilsta2023@gmail.com',
      'phone', '+675 82545274',
      'phoneHref', '+67582545274',
      'location', 'Gumini Village, Huhu LLG, Alotau District, Milne Bay Province, Papua New Guinea',
      'postalAddress', 'P.O. Box 424, Alotau, Milne Bay Province, Papua New Guinea',
      'registrationNumber', '6-129295384',
      'tin', '502603269'
    ),
    'Public company identity and contact details. Served read-only through GET /api/v1/site.'
  ),
  (
    'homepage',
    jsonb_build_object(
      'heroEyebrow', 'Business & ICT consultants · Alotau, Milne Bay Province',
      'heroTitle', 'Clear thinking. Practical systems. Stronger organisations.',
      'heroDescription', 'KILSTA helps individuals, businesses, institutions and communities in Papua New Guinea strengthen their operations through dependable business advisory, ICT services and practical training.',
      'heroPrimaryCta', 'Request a quote',
      'heroSecondaryCta', 'Explore our services',
      'supportingNote', 'Registered in Papua New Guinea · Registration 6-129295384'
    ),
    'Homepage hero copy. Served read-only through GET /api/v1/site.'
  )
on conflict (key) do nothing;

-- -----------------------------------------------------------------------------
-- Services
-- -----------------------------------------------------------------------------
insert into public.services
  (slug, title, category, summary, description, features, icon, featured, published, sort_order)
values
  (
    'business-profile-writing',
    'Business Profile Writing',
    'business',
    'A clear, credible business profile that explains who you are, what you offer and why customers should work with you.',
    'We work with you to document your organisation''s background, products and services, target customers, operating approach and goals. The result is a professional profile suitable for tenders, partnerships, funding conversations and everyday marketing.',
    array['Structured discovery session', 'Professional written profile', 'Editable copy for reuse', 'Alignment with tender requirements'],
    'FileText', true, true, 10
  ),
  (
    'business-registration-assistance',
    'Business Registration Assistance',
    'business',
    'Guidance through the paperwork and requirements for registering a business in Papua New Guinea.',
    'We help you prepare and organise the information needed for business registration, explain the steps involved and assist with completing application documentation. Statutory fees are set by the relevant authority and are separate from our service.',
    array['Requirements checklist', 'Document preparation guidance', 'Application form assistance', 'Record-keeping advice'],
    'Building2', true, true, 20
  ),
  (
    'tin-application-assistance',
    'TIN Application Assistance',
    'business',
    'Practical assistance with preparing a Tax Identification Number application.',
    'We assist with completing TIN application requirements and organising supporting documents. We are not a substitute for the Papua New Guinea Internal Revenue Commission or for independent tax advice; approvals and assessments remain with the relevant authority.',
    array['Document checklist', 'Application preparation', 'Submission guidance', 'Compliance reminders'],
    'BadgeCheck', false, true, 30
  ),
  (
    'project-proposals',
    'Project Proposals',
    'business',
    'Well-structured proposals that present your idea, budget and expected outcomes professionally.',
    'We help turn your concept into a clear proposal: problem statement, objectives, activities, timeline, budget and expected results. Useful for grant applications, donor programmes, tenders and internal approvals.',
    array['Proposal structure and writing', 'Budget presentation', 'Timeline and milestones', 'Review and refinement'],
    'ClipboardList', true, true, 40
  ),
  (
    'bookkeeping',
    'Bookkeeping',
    'business',
    'Organised records and simple reporting that help you understand the financial position of your business.',
    'We assist with recording income and expenses, reconciling records and preparing straightforward summaries for management. Our bookkeeping support is not an audit or a substitute for licensed accounting and tax advice.',
    array['Income and expense records', 'Reconciliation support', 'Simple management summaries', 'Document organisation'],
    'Calculator', false, true, 50
  ),
  (
    'administration-training',
    'Administration Training',
    'business',
    'Practical office administration skills for teams that want cleaner processes and more confident staff.',
    'Training can cover records management, correspondence, meeting documentation, filing systems and everyday office coordination. Content is adapted to your organisation after a short needs discussion.',
    array['Tailored content', 'Practical exercises', 'Templates and checklists', 'On-site or online delivery'],
    'GraduationCap', false, true, 60
  ),
  (
    'computer-networking',
    'Computer Networking',
    'ict',
    'Design and set-up of reliable local networks for offices, schools and institutions.',
    'We assess your premises and requirements, then plan and set up wired and wireless network equipment, addressing and access. We explain the design and hand over basic operating information so your team knows how the network fits together.',
    array['Site and requirements assessment', 'Wired and wireless set-up', 'Router and access point configuration', 'Handover guidance'],
    'Network', true, true, 70
  ),
  (
    'starlink-installation',
    'Starlink Installation',
    'ict',
    'Professional installation and basic configuration of Starlink internet equipment.',
    'We install and position Starlink equipment for a clear view of the sky, connect the service and help you test connectivity. Site conditions, equipment availability and subscription costs are confirmed before work begins.',
    array['Site suitability check', 'Equipment installation', 'Connectivity testing', 'Basic user orientation'],
    'Satellite', true, true, 80
  ),
  (
    'computer-repairs',
    'Computer Repairs',
    'ict',
    'Diagnosis and repair support for desktop and laptop computers.',
    'We inspect and diagnose common hardware and software problems, explain the options and carry out agreed repairs. Parts are quoted separately and data recovery is not guaranteed; back-ups should be maintained by the device owner.',
    array['Fault diagnosis', 'Clear repair options', 'Software clean-up', 'Parts quoted separately'],
    'Wrench', false, true, 90
  ),
  (
    'product-sales',
    'Product Sales',
    'ict',
    'Supply of selected computer, networking and connectivity equipment.',
    'We source selected ICT equipment for customers in Papua New Guinea. Availability, specifications, warranty terms and pricing are confirmed at the time of quotation. Browse the catalogue or contact us for a current quotation.',
    array['Confirmed specifications', 'Written quotations', 'Delivery arrangements discussed', 'Warranty information provided'],
    'ShoppingCart', false, true, 100
  ),
  (
    'database-development',
    'Database Development',
    'ict',
    'Structured data systems that help you store, find and report on information reliably.',
    'We design practical database-backed systems for records, registers and reporting needs. The scope is agreed in writing, including data ownership, access rules and handover. We prioritise simple, maintainable solutions over unnecessary complexity.',
    array['Requirements workshop', 'Data model design', 'Secure access rules', 'Documentation and handover'],
    'Database', false, true, 110
  ),
  (
    'website-design',
    'Website Design',
    'ict',
    'Professional, mobile-friendly websites that present your organisation clearly.',
    'We plan, design and build websites with clear content, responsive layouts and sensible contact forms. Domain, hosting and third-party subscriptions are quoted separately and remain under your ownership.',
    array['Content and structure planning', 'Responsive design', 'Accessible contact forms', 'Handover and basic training'],
    'Globe', true, true, 120
  ),
  (
    'technical-projects',
    'Technical Projects',
    'ict',
    'Planned ICT projects delivered with clear scope, communication and documentation.',
    'For larger installations and organisational technology projects, we help define the scope, sequence the work and document the outcome. Every engagement begins with a written quotation and agreed responsibilities.',
    array['Scope and milestones', 'Coordinated delivery', 'Progress communication', 'Completion documentation'],
    'Cpu', false, true, 130
  ),
  (
    'ict-training',
    'ICT Training',
    'training',
    'Practical computer and digital skills training for individuals, teams and institutions.',
    'Our training is hands-on and adapted to the participants'' starting point. Courses include basic computing, Microsoft Office, timetabling software and internet services. See the training page for current course outlines.',
    array['Beginner-friendly delivery', 'Hands-on practice', 'Small group options', 'Certificate of participation'],
    'MonitorSmartphone', true, true, 140
  )
on conflict (slug) do nothing;

-- -----------------------------------------------------------------------------
-- Courses
-- -----------------------------------------------------------------------------
insert into public.courses
  (slug, title, category, summary, description, level, duration, price, currency, schedule, delivery_mode, published, sort_order)
values
  (
    'basic-computing',
    'Basic Computing',
    'basic-computing',
    'Build confidence with computers: parts, files, typing, email and safe everyday use.',
    'Designed for beginners and anyone returning to study. Participants practise using a computer, managing files, writing simple documents, sending email and staying safe online. Training pace is adjusted to the group.',
    'Beginner',
    'Flexible — confirmed on enquiry',
    null,
    'PGK',
    'Scheduled on enquiry',
    'On-site or online',
    true,
    10
  ),
  (
    'microsoft-office',
    'Microsoft Office',
    'microsoft-office',
    'Practical Word, Excel and PowerPoint skills for office and study tasks.',
    'A hands-on introduction to everyday Microsoft Office tasks: formatting documents in Word, building basic spreadsheets and formulas in Excel, and preparing clear presentations in PowerPoint. Exercises use realistic office scenarios.',
    'Beginner to intermediate',
    'Flexible — confirmed on enquiry',
    null,
    'PGK',
    'Scheduled on enquiry',
    'On-site or online',
    true,
    20
  ),
  (
    'timetabling-software',
    'Timetabling Software',
    'software-training',
    'Learn to prepare and manage institutional timetables using computer-based tools.',
    'For schools and institutions that need to move timetable preparation off paper. Participants work through entering resources, constraints and classes, producing a timetable and making routine changes.',
    'Intermediate',
    'Flexible — confirmed on enquiry',
    null,
    'PGK',
    'Scheduled on enquiry',
    'On-site',
    true,
    30
  ),
  (
    'internet-services',
    'Internet Services',
    'internet-services',
    'Use internet services confidently and safely: browsing, email, cloud files and video calls.',
    'Covers connecting to the internet, effective searching, email attachments, shared cloud files, video meeting basics and recognising common online scams. Suitable for community groups, small businesses and institutions.',
    'Beginner',
    'Flexible — confirmed on enquiry',
    null,
    'PGK',
    'Scheduled on enquiry',
    'On-site or online',
    true,
    40
  )
on conflict (slug) do nothing;

-- -----------------------------------------------------------------------------
-- Sample portfolio records (NOT published; clearly marked as samples)
-- -----------------------------------------------------------------------------
insert into public.projects
  (slug, title, category, client_name, summary, description, completed_at, featured, published, is_sample, sort_order)
values
  (
    'sample-office-network-upgrade',
    'Sample record — Office Network Upgrade',
    'ict',
    null,
    'Illustrative sample only. Replace with a verified project after client approval.',
    'This row exists so administrators can preview the portfolio layout. It does not describe a real KILSTA engagement, client or completed project. Delete it or replace it with verified information before publishing.',
    null,
    false,
    false,
    true,
    10
  ),
  (
    'sample-business-profile-engagement',
    'Sample record — Business Profile Engagement',
    'business',
    null,
    'Illustrative sample only. Replace with a verified project after client approval.',
    'This row exists so administrators can preview the portfolio layout. It does not describe a real KILSTA engagement, client or completed project. Delete it or replace it with verified information before publishing.',
    null,
    false,
    false,
    true,
    20
  )
on conflict (slug) do nothing;

-- -----------------------------------------------------------------------------
-- Sample product records (NOT published; availability must be confirmed)
-- -----------------------------------------------------------------------------
insert into public.products
  (sku, slug, name, category, description, price, currency, stock_quantity, low_stock_threshold, track_stock, published, is_sample, sort_order)
values
  (
    'SAMPLE-STARLINK-KIT',
    'sample-starlink-standard-kit',
    'Sample listing — Starlink Standard Kit',
    'Connectivity',
    'Sample catalogue record for demonstration. Pricing, availability and warranty are confirmed on quotation. Not a confirmed stock item.',
    null,
    'PGK',
    0,
    1,
    true,
    false,
    true,
    10
  ),
  (
    'SAMPLE-SWITCH-8P',
    'sample-8-port-gigabit-switch',
    'Sample listing — 8-Port Gigabit Switch',
    'Networking',
    'Sample catalogue record for demonstration. Specifications and availability are confirmed on quotation. Not a confirmed stock item.',
    null,
    'PGK',
    0,
    2,
    true,
    false,
    true,
    20
  ),
  (
    'SAMPLE-LAPTOP-BIZ',
    'sample-business-laptop',
    'Sample listing — Business Laptop',
    'Computers',
    'Sample catalogue record for demonstration. Model, specifications, price and warranty are confirmed on quotation. Not a confirmed stock item.',
    null,
    'PGK',
    0,
    1,
    true,
    false,
    true,
    30
  )
on conflict (slug) do nothing;
