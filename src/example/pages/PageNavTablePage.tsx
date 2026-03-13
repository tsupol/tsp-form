import { useRef, useState } from 'react';
import { PageNav, PageNavPanel, type PageNavContext } from '../../components/PageNav';
import { DataTable } from '../../components/DataTable';
import { clsx } from 'clsx';
import { ArrowRightFromLine } from 'lucide-react';

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'draft' | 'archived';
};

const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys'];

const products: Product[] = Array.from({ length: 48 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  category: categories[i % categories.length],
  price: Math.round((Math.random() * 200 + 10) * 100) / 100,
  stock: Math.floor(Math.random() * 500),
  status: (['active', 'draft', 'archived'] as const)[i % 3],
}));

const statusColor: Record<Product['status'], string> = {
  active: 'bg-green-500/15 text-green-700',
  draft: 'bg-yellow-500/15 text-yellow-700',
  archived: 'bg-neutral-500/15 text-neutral-500',
};

function MenuToggleButton() {
  return (
    <button
      className="flex items-center justify-center w-12 h-12 cursor-pointer hover:bg-surface-hover transition-colors"
      aria-label="Open menu"
      onClick={() => window.dispatchEvent(new CustomEvent('sidemenu:open'))}
    >
      <ArrowRightFromLine size={18} />
    </button>
  );
}

function ProductDetail({ product }: { product: Product | null }) {
  if (!product) {
    return (
      <div className="flex items-center justify-center h-full opacity-40">
        <p>Select a product to view details</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-lg bg-primary/15 text-primary flex items-center justify-center font-semibold text-lg">
          {product.id}
        </div>
        <div>
          <h2 className="text-lg font-semibold">{product.name}</h2>
          <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', statusColor[product.status])}>
            {product.status}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="card">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm opacity-50 mb-1">Category</div>
              <div className="font-medium">{product.category}</div>
            </div>
            <div>
              <div className="text-sm opacity-50 mb-1">Price</div>
              <div className="font-medium">${product.price.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm opacity-50 mb-1">Stock</div>
              <div className="font-medium">{product.stock} units</div>
            </div>
            <div>
              <div className="text-sm opacity-50 mb-1">Status</div>
              <div className="font-medium capitalize">{product.status}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="heading-3 mb-2">Description</h3>
          <p className="opacity-80 leading-relaxed">
            This is a sample product description for {product.name}. It belongs to the {product.category} category
            and is currently {product.status}. The unit price is ${product.price.toFixed(2)} with {product.stock} units
            in stock.
          </p>
        </div>
      </div>
    </div>
  );
}

export function PageNavTablePage() {
  const [selected, setSelected] = useState<Product | null>(null);
  const [filter, setFilter] = useState('');
  const navRef = useRef<{ isMobile: boolean; goTo: PageNavContext['goTo'] }>({ isMobile: false, goTo: () => {} });

  const filtered = filter
    ? products.filter((p) => p.name.toLowerCase().includes(filter.toLowerCase()) || p.category.toLowerCase().includes(filter.toLowerCase()))
    : products;

  return (
    <PageNav panels={['list', 'detail']} mobileBreakpoint={768} className="h-dvh">
      {({ isMobile, isRoot, goTo, Header }) => {
        navRef.current = { isMobile, goTo };

        return (
          <>
            {isMobile && (
              <Header
                title={isRoot ? 'Products' : selected?.name}
                startContent={isRoot ? <MenuToggleButton /> : undefined}
              />
            )}
            {!isMobile && (
              <div className="px-6 py-4 border-b border-line">
                <h1 className="heading-1">Products</h1>
                <p className="text-muted">Browse and manage product inventory.</p>
              </div>
            )}
            <div className={isMobile ? 'pagenav-panels' : 'flex flex-1 min-h-0'}>
              <PageNavPanel id="list" className="flex-1 min-w-0 flex flex-col" mobileClassName="flex flex-col overflow-hidden">
                <div className="px-4 py-3 border-b border-line shrink-0">
                  <input
                    type="text"
                    placeholder="Filter products..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-line bg-surface text-sm outline-none focus:border-primary"
                  />
                </div>
                <DataTable
                  data={filtered}
                  enablePagination
                  pageSize={8}
                  className="flex-1 min-h-0 border-none"
                  controlSize="sm"
                  renderRow={(row) => {
                    const p = row.original;
                    return (
                      <button
                        className={clsx(
                          'w-full text-left px-4 py-6 border-b border-line transition-colors cursor-pointer flex items-center gap-3',
                          selected?.id === p.id ? 'bg-primary/10' : 'hover:bg-surface-hover'
                        )}
                        onClick={() => {
                          setSelected(p);
                          if (navRef.current.isMobile) navRef.current.goTo('detail');
                        }}
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-medium shrink-0">
                          {p.id}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{p.name}</div>
                          <div className="text-sm opacity-60 truncate">{p.category}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-medium">${p.price.toFixed(2)}</div>
                          <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', statusColor[p.status])}>
                            {p.status}
                          </span>
                        </div>
                      </button>
                    );
                  }}
                  noResults={<div className="py-8 text-center opacity-40">No products found</div>}
                />
              </PageNavPanel>
              <PageNavPanel id="detail" className="w-96 border-l border-line overflow-y-auto better-scroll">
                <ProductDetail product={selected} />
              </PageNavPanel>
            </div>
          </>
        );
      }}
    </PageNav>
  );
}
