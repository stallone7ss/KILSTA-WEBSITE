import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PackageSearch, Search, ShieldCheck } from 'lucide-react';
import { Seo } from '../components/ui/Seo';
import { PageHero } from '../components/site/Section';
import { ProductCard } from '../components/site/Cards';
import { ContactCta } from '../components/site/ContactCta';
import { EmptyState, ErrorBlock, LoadingBlock } from '../components/ui/Feedback';
import { Badge } from '../components/ui/Badge';
import { useApi } from '../hooks/useApi';
import { listProducts } from '../services/content';
import type { Product } from '../types';

export function ProductsPage() {
  const products = useApi<Product[]>((signal) => listProducts({ signal }), []);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const categories = useMemo(() => {
    const values = new Set((products.data ?? []).map((product) => product.category));
    return [...values].sort((a, b) => a.localeCompare(b));
  }, [products.data]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (products.data ?? []).filter((product) => {
      const matchesCategory = category === 'all' || product.category === category;
      const matchesSearch =
        !term ||
        [product.name, product.sku, product.category, product.description]
          .join(' ')
          .toLowerCase()
          .includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [products.data, search, category]);

  return (
    <>
      <Seo
        title="Products"
        description="Selected ICT equipment available through KILSTA Business & ICT Consultants. Specifications, availability and pricing are confirmed on enquiry."
        path="/products"
      />

      <PageHero
        eyebrow="Products"
        title="Selected equipment, confirmed on enquiry"
        description="We source selected computer, networking and connectivity equipment. Catalogue listings are an invitation to enquire — they do not confirm current stock, final price or warranty terms."
        actions={
          <Link to="/contact?subject=Product%20enquiry" className="btn-primary">
            Make a product enquiry
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        }
      />

      <section className="bg-white py-14 sm:py-20">
        <div className="container-page">
          <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full max-w-md">
              <label htmlFor="product-search" className="field-label">
                Search the catalogue
              </label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="product-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name, category or SKU"
                  className="input-base pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:max-w-xs">
              <label htmlFor="product-category" className="field-label">
                Category
              </label>
              <select
                id="product-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="input-base appearance-none bg-white pr-9"
              >
                <option value="all">All categories</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500" role="status" aria-live="polite">
              {products.loading
                ? 'Loading products…'
                : `${filtered.length} product${filtered.length === 1 ? '' : 's'} shown`}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge tone="neutral">Prices confirmed on quotation</Badge>
              <Badge tone="teal">Availability checked before order</Badge>
            </div>
          </div>

          <div className="mt-8">
            {products.loading ? (
              <LoadingBlock rows={3} label="Loading products" />
            ) : products.error ? (
              <ErrorBlock message={products.error} onRetry={products.reload} />
            ) : filtered.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (products.data ?? []).length === 0 ? (
              <EmptyState
                icon={<PackageSearch className="h-5 w-5" />}
                title="No product listings are published yet"
                description="We are not displaying unverified stock or sample products. Contact us with what you need and we will confirm what can be sourced, at what price and with what warranty."
                action={
                  <Link to="/contact?subject=Product%20enquiry" className="btn-primary">
                    Ask about availability
                  </Link>
                }
              />
            ) : (
              <EmptyState
                icon={<Search className="h-5 w-5" />}
                title="No products match those filters"
                description="Try a different search term or choose another category."
                action={
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => {
                      setSearch('');
                      setCategory('all');
                    }}
                  >
                    Clear filters
                  </button>
                }
              />
            )}
          </div>
        </div>
      </section>

      <section className="bg-mist py-14 sm:py-20">
        <div className="container-page grid gap-6 sm:grid-cols-3">
          {[
            {
              title: 'Specifications first',
              text: 'We confirm model, specification and compatibility before quoting so you know what you are ordering.'
            },
            {
              title: 'Written quotation',
              text: 'Price, delivery arrangements, availability and warranty information are provided in writing.'
            },
            {
              title: 'No hidden stock claims',
              text: 'A catalogue listing is not a promise of stock. We check availability before accepting an order.'
            }
          ].map((item) => (
            <div key={item.title} className="card-surface p-5">
              <ShieldCheck className="h-5 w-5 text-teal-600" aria-hidden="true" />
              <h2 className="mt-3 text-sm font-semibold text-navy-900">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <ContactCta
        title="Looking for something specific?"
        description="Tell us the equipment, quantity and location. We will confirm what can be sourced and provide a written quotation."
        primaryLabel="Request a quote"
        secondaryLabel="Contact us"
        secondaryTo="/contact"
      />
    </>
  );
}
