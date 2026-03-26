// ============================================================================
// MobileHeader Example
//
// Demonstrates MobileHeader across a parent → child route hierarchy
// with iOS-style slide transitions on mobile:
//
//   /mobile-header              — Article list (sidemenu toggle + actions)
//   /mobile-header/article/:id  — Article detail (back button)
//     Article 3 ("TypeScript Generics") has a PageNav inside it, adding
//     another navigation level (Content / Examples sub-panels on mobile).
//
// Key patterns:
//   1. Parent page: MobileHeader with sidemenu toggle + scroll-reveal title
//   2. Child page: MobileHeader with back button + article title
//   3. Child with PageNav: MobileHeader header adapts when in sub-panels
//   4. All headers hidden on desktop via `md:hidden`
//   5. AnimatedOutlet slides child route in/out on mobile
// ============================================================================

import { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MobileHeader } from '../../components/MobileHeader';
import { ScrollReveal } from '../../components/ScrollReveal';
import { PageNav, PageNavPanel } from '../../components/PageNav';
import { AnimatedOutlet } from '../../components/AnimatedOutlet';
import { ArrowLeft, ArrowRightFromLine, Bookmark, Code, FileText, Share2 } from 'lucide-react';

// ── Scroll detection (example-level helper) ─────────────────────────────────

function useScrolled(sentinel: React.RefObject<Element | null>) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [sentinel]);

  return scrolled;
}

// ── Data ────────────────────────────────────────────────────────────────────

type Article = {
  id: number;
  title: string;
  category: string;
  excerpt: string;
  sections: { heading: string; body: string }[];
  hasSubNav: boolean;
};

const articles: Article[] = [
  {
    id: 1, title: 'Getting Started with CSS Custom Properties', category: 'CSS', hasSubNav: false,
    excerpt: 'Learn how to use CSS variables to create flexible, maintainable design systems.',
    sections: [
      { heading: 'What Are Custom Properties?', body: 'CSS custom properties (also known as CSS variables) are entities defined by CSS authors that contain specific values to be reused throughout a document. They are set using custom property notation and accessed using the var() function.' },
      { heading: 'Why Not Preprocessor Variables?', body: 'Unlike preprocessor variables (Sass, Less), CSS custom properties are live — they cascade, inherit, and can be changed at runtime with JavaScript. This makes them ideal for theming, responsive design, and component-level customization.' },
      { heading: 'Defining Variables', body: 'To define a custom property, prefix the name with two dashes and declare it in a ruleset. The :root selector is commonly used for global variables, but they can be scoped to any selector.' },
    ],
  },
  {
    id: 2, title: 'Building Accessible React Components', category: 'React', hasSubNav: false,
    excerpt: 'A comprehensive guide to ARIA attributes, keyboard navigation, focus management, and screen reader support in React applications.',
    sections: [
      { heading: 'Why Accessibility Matters', body: 'Accessibility (a11y) ensures that your application can be used by everyone, including people who rely on assistive technologies like screen readers, keyboard navigation, or voice control. Beyond ethical responsibility, accessibility is a legal requirement in many jurisdictions — the ADA, Section 508, and the European Accessibility Act all mandate digital accessibility for public-facing services.\n\nAccessible applications also tend to be better applications overall. The constraints of a11y push you toward cleaner markup, more predictable interactions, and better separation of concerns. When you build for screen readers, you often end up with a more robust DOM structure that benefits all users.' },
      { heading: 'Semantic HTML First', body: 'The single most impactful thing you can do for accessibility is use the right HTML elements. A <button> is inherently focusable, responds to Enter and Space, and is announced as a button by screen readers. A <div onClick> does none of these things without manual work.\n\nPrefer <nav> over <div class="nav">, <main> over <div class="content">, <section> with headings over generic <div> wrappers. These landmarks help screen reader users navigate the page structure without reading every word.\n\nIn React, this means resisting the urge to wrap everything in <div>. Use Fragments (<>) when you need a wrapper without a DOM node, and semantic elements when you need actual structure.' },
      { heading: 'ARIA Roles and Properties', body: 'ARIA (Accessible Rich Internet Applications) provides attributes that fill the gaps where HTML semantics fall short. role="dialog" tells screen readers that a div is a modal. aria-expanded communicates the state of a collapsible panel. aria-live="polite" announces dynamic content changes without interrupting the user.\n\nHowever, the first rule of ARIA is: don\'t use ARIA if you can use a native HTML element instead. ARIA adds semantics but not behavior — aria-disabled="true" doesn\'t actually disable the element. Native HTML attributes like disabled do both.\n\nCommon ARIA patterns in React components:\n- Modals: role="dialog", aria-modal="true", aria-labelledby pointing to the title\n- Tabs: role="tablist", role="tab", role="tabpanel", aria-selected\n- Combobox/Select: role="listbox", role="option", aria-activedescendant\n- Alerts: role="alert" or aria-live="assertive" for urgent notifications' },
      { heading: 'Keyboard Navigation', body: 'Every interactive element must be operable with a keyboard alone. This means:\n\n1. All clickable elements must be focusable (use <button> or tabindex="0")\n2. Focus order must follow a logical reading sequence\n3. Custom widgets need arrow key navigation (e.g., tabs, menus, listboxes)\n4. Escape should close modals, popovers, and dropdowns\n5. Enter/Space should activate the focused element\n\nReact\'s onKeyDown handler is your primary tool here. For complex widgets, implement a roving tabindex pattern: only one item in a group has tabindex="0" (the active one), the rest have tabindex="-1". Arrow keys move the active index and focus.\n\nDon\'t forget skip links — a hidden link at the top of the page that becomes visible on focus and jumps to the main content, bypassing repetitive navigation.' },
      { heading: 'Focus Management', body: 'React\'s virtual DOM can cause focus to get lost when components re-render. Common scenarios:\n\n- Opening a modal: focus should move to the modal (usually the close button or first focusable element)\n- Closing a modal: focus should return to the element that triggered it\n- Deleting a list item: focus should move to the next item (or previous, if it was the last)\n- Route changes: focus should move to the new page\'s main heading or content area\n\nUse useRef to store focus targets and useEffect to move focus at the right time. The FocusTrap pattern (cycling Tab within a modal) prevents focus from escaping to the background content.\n\nReact 18\'s flushSync can be useful when you need focus to move synchronously after a state update, though it should be used sparingly.' },
      { heading: 'Color Contrast and Visual Design', body: 'WCAG 2.1 requires a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text (18px bold or 24px regular). This applies to text on backgrounds, icons that convey meaning, and form control borders.\n\nDon\'t rely on color alone to convey information. A form field with only a red border for errors is invisible to colorblind users — add an icon, text message, or pattern. Status badges should include text labels, not just colored dots.\n\nFor focus indicators, ensure they have at least 3:1 contrast against the surrounding background and are at least 2px thick. The default browser outline is often sufficient, but if you customize it, maintain these ratios.' },
      { heading: 'Testing Accessibility', body: 'Automated tools catch about 30-40% of accessibility issues. The rest require manual testing:\n\n- Tab through the entire page — can you reach and operate everything?\n- Use a screen reader (VoiceOver on Mac, NVDA on Windows) — does the content make sense?\n- Zoom to 200% — does the layout still work?\n- Use Windows High Contrast Mode — are all interactive elements visible?\n\nFor automated testing, axe-core (via @axe-core/react or jest-axe) catches common issues like missing alt text, insufficient contrast, and invalid ARIA. ESLint with eslint-plugin-jsx-a11y catches issues at development time.\n\nConsider adding accessibility checks to your CI pipeline. It won\'t catch everything, but it prevents regressions on the low-hanging fruit.' },
    ],
  },
  {
    id: 3, title: 'TypeScript Generics Deep Dive', category: 'TypeScript', hasSubNav: true,
    excerpt: 'From basic constraints to conditional types and mapped types.',
    sections: [
      { heading: 'What Are Generics?', body: 'Generics provide a way to create reusable components that work with a variety of types rather than a single one. They allow you to write flexible, type-safe code without sacrificing the benefits of TypeScript\'s type system.' },
      { heading: 'Type Parameters', body: 'A generic function or class accepts type parameters that act as placeholders for actual types. When the function is called, TypeScript infers or receives the concrete type.' },
      { heading: 'Advanced Patterns', body: 'Advanced patterns include conditional types (T extends U ? X : Y), mapped types (transforming properties), and template literal types for string manipulation at the type level.' },
    ],
  },
  {
    id: 4, title: 'Performance Optimization Patterns', category: 'Performance', hasSubNav: false,
    excerpt: 'Bundle size, lazy loading, and browser caching strategies.',
    sections: [
      { heading: 'Reducing Bundle Size', body: 'Code splitting with React.lazy and Suspense allows you to load components on demand. Tree shaking eliminates unused exports from the final bundle.' },
      { heading: 'Minimizing Re-renders', body: 'Memoization with useMemo and useCallback prevents unnecessary computations. React.memo skips re-rendering when props haven\'t changed.' },
      { heading: 'Browser-Level Optimization', body: 'HTTP caching headers, service workers, image optimization, and preloading critical resources all contribute to faster load times and snappier interactions.' },
    ],
  },
  {
    id: 5, title: 'State Management Without Libraries', category: 'React', hasSubNav: false,
    excerpt: 'Context, useReducer, and URL state can handle more than you think.',
    sections: [
      { heading: 'Built-in React State', body: 'useState and useReducer handle local component state. Context API shares state across a subtree without prop drilling.' },
      { heading: 'URL State', body: 'URL state (search params, path params) is often overlooked but is perfect for filters, pagination, and selected items — it\'s shareable, bookmarkable, and survives page refreshes.' },
      { heading: 'When You Need a Library', body: 'Server state libraries (TanStack Query, SWR) handle async data. For complex client state with many subscribers, Zustand or Jotai may be justified — but most apps don\'t need them.' },
    ],
  },
];

const categoryColor: Record<string, string> = {
  CSS: 'bg-blue-500/15 text-blue-400',
  React: 'bg-green-500/15 text-green-400',
  TypeScript: 'bg-purple-500/15 text-purple-400',
  Performance: 'bg-orange-500/15 text-orange-400',
};

const codeExamples = [
  { title: 'Basic Generic Function', code: 'function identity<T>(arg: T): T {\n  return arg;\n}\n\nconst result = identity<string>("hello");\nconst inferred = identity(42); // T is number' },
  { title: 'Generic Constraints', code: 'interface HasLength {\n  length: number;\n}\n\nfunction logLength<T extends HasLength>(arg: T): T {\n  console.log(arg.length);\n  return arg;\n}\n\nlogLength("hello");     // OK\nlogLength([1, 2, 3]);   // OK\n// logLength(123);      // Error!' },
  { title: 'Conditional Types', code: 'type IsString<T> = T extends string ? true : false;\n\ntype A = IsString<"hello">; // true\ntype B = IsString<42>;      // false\n\n// Practical: extract return type\ntype ReturnOf<T> = T extends (...args: any[]) => infer R\n  ? R\n  : never;' },
  { title: 'Mapped Types', code: 'type Readonly<T> = {\n  readonly [K in keyof T]: T[K];\n};\n\ntype Partial<T> = {\n  [K in keyof T]?: T[K];\n};\n\ntype Pick<T, K extends keyof T> = {\n  [P in K]: T[P];\n};' },
];

// ── Article List (parent view — rendered as fallback in AnimatedOutlet) ──────

function ArticleList() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const scrolled = useScrolled(scrollRef);

  return (
    <>
      <div ref={scrollRef} />
      <MobileHeader className={`md:hidden ${scrolled ? 'mobile-header-scrolled' : ''}`}>
        <div className="mobile-header-start">
          <button
            className="flex items-center justify-center w-nav h-nav cursor-pointer hover:bg-surface-hover transition-colors"
            aria-label="Open menu"
            onClick={() => window.dispatchEvent(new CustomEvent('sidemenu:open'))}
          >
            <ArrowRightFromLine size={18} />
          </button>
        </div>
        <div className="mobile-header-title">
          <ScrollReveal sentinel={titleRef}>Articles</ScrollReveal>
        </div>
      </MobileHeader>

      <div className="page-content">
        <h1 ref={titleRef} className="heading-1 mb-1">Articles</h1>
        <p className="text-muted mb-6">Browse recent articles and tutorials.</p>

        <div className="flex flex-col gap-3">
          {articles.map((article) => (
            <div
              key={article.id}
              className="card cursor-pointer hover:bg-surface-hover transition-colors"
              onClick={() => navigate(`/mobile-header/article/${article.id}`)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor[article.category] ?? ''}`}>
                      {article.category}
                    </span>
                    {article.hasSubNav && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-surface-elevated opacity-60">
                        + PageNav
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold mb-1">{article.title}</h3>
                  <p className="text-sm opacity-60 line-clamp-2">{article.excerpt}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Article Detail (child page — simple) ────────────────────────────────────

function ArticleDetailSimple({ article }: { article: Article }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const scrolled = useScrolled(scrollRef);

  return (
    <>
      <div ref={scrollRef}/>
      <MobileHeader className={`md:hidden ${scrolled ? 'mobile-header-scrolled-shadow' : ''}`}>
        <div className="mobile-header-start">
          <button
            className="flex items-center justify-center w-nav h-nav cursor-pointer hover:bg-surface-hover transition-colors"
            aria-label="Go back"
            onClick={() => navigate('/mobile-header')}
          >
            <ArrowLeft size={20}/>
          </button>
        </div>
        <div className="mobile-header-title">
          <ScrollReveal sentinel={titleRef}>{article.title}</ScrollReveal>
        </div>
        <div className="mobile-header-end">
          <button className="flex items-center justify-center pl-3 pr-2 h-nav cursor-pointer hover:bg-surface-hover transition-colors" aria-label="Bookmark">
            <Bookmark size={18}/>
          </button>
          <button className="flex items-center justify-center pl-2 pr-4 h-nav cursor-pointer hover:bg-surface-hover transition-colors" aria-label="Share">
            <Share2 size={18}/>
          </button>
        </div>
      </MobileHeader>

      <div className="page-content">
        <div className="flex items-center gap-2 mb-2">
          <button
            className="hidden md:flex items-center gap-1 text-sm opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            onClick={() => navigate('/mobile-header')}
          >
            <ArrowLeft size={14}/>
            Articles
          </button>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor[article.category] ?? ''}`}>
          {article.category}
        </span>
        <h1 ref={titleRef} className="heading-1 mt-2 mb-1">{article.title}</h1>
        <p className="text-muted mb-6">{article.excerpt}</p>

        {article.sections.map((section, i) => (
          <div key={i} className="mb-6">
            <h2 className="heading-3 mb-2">{section.heading}</h2>
            {section.body.split('\n\n').map((p, j) => (
              <p key={j} className="opacity-80 leading-relaxed mb-3">{p}</p>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

// ── Article Detail with PageNav (child page — has sub-navigation) ───────────

function ArticleDetailWithPageNav({ article }: { article: Article }) {
  const navigate = useNavigate();

  return (
    <PageNav panels={['content', 'examples']} className="h-full">
      {({ isMobile, isRoot, goTo, goBack: pageNavBack }) => (
        <>
          <MobileHeader className="md:hidden mobile-header-scrolled">
            <div className="mobile-header-start">
              <button
                className="flex items-center justify-center w-nav h-nav cursor-pointer hover:bg-surface-hover transition-colors"
                aria-label="Go back"
                onClick={() => {
                  if (isRoot) {
                    navigate('/mobile-header');
                  } else {
                    pageNavBack();
                  }
                }}
              >
                <ArrowLeft size={20} />
              </button>
            </div>
            <div className="mobile-header-title mobile-header-title-truncate">
              {isRoot ? article.title : 'Code Examples'}
            </div>
            {isRoot && (
              <div className="mobile-header-end">
                <button className="flex items-center justify-center pl-2 pr-4 h-nav cursor-pointer hover:bg-surface-hover transition-colors" aria-label="Bookmark">
                  <Bookmark size={18} />
                </button>
              </div>
            )}
          </MobileHeader>

          {!isMobile && (
            <div className="px-6 py-4 border-b border-line">
              <div className="flex items-center gap-2 mb-2">
                <button
                  className="flex items-center gap-1 text-sm opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => navigate('/mobile-header')}
                >
                  <ArrowLeft size={14} />
                  Articles
                </button>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor[article.category] ?? ''}`}>
                {article.category}
              </span>
              <h1 className="heading-1 mt-2">{article.title}</h1>
            </div>
          )}

          <div className={isMobile ? 'pagenav-panels' : 'flex flex-1 min-h-0'}>
            <PageNavPanel id="content" className="flex-1 overflow-y-auto better-scroll">
              <div className="p-6">
                <p className="text-muted mb-6">{article.excerpt}</p>
                {article.sections.map((section, i) => (
                  <div key={i} className="mb-6">
                    <h2 className="heading-3 mb-2">{section.heading}</h2>
                    {section.body.split('\n\n').map((p, j) => (
                      <p key={j} className="opacity-80 leading-relaxed mb-3">{p}</p>
                    ))}
                  </div>
                ))}
                <button
                  className="flex items-center gap-2 mt-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                  onClick={() => goTo('examples')}
                >
                  <Code size={16} />
                  View Code Examples
                </button>
              </div>
            </PageNavPanel>

            <PageNavPanel id="examples" className="w-96 border-l border-line overflow-y-auto better-scroll">
              <div className="p-6">
                <h2 className="heading-3 mb-4">Code Examples</h2>
                <div className="flex flex-col gap-4">
                  {codeExamples.map((ex, i) => (
                    <div key={i} className="card">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <FileText size={14} className="opacity-50" />
                        {ex.title}
                      </h3>
                      <pre className="text-xs bg-surface-shallow rounded-lg p-3 overflow-x-auto better-scroll">
                        <code>{ex.code}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            </PageNavPanel>
          </div>
        </>
      )}
    </PageNav>
  );
}

// ── Article Detail Route (child route component) ────────────────────────────

export function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const article = articles.find((a) => a.id === Number(id));

  if (!article) {
    return (
      <div className="page-content">
        <p className="text-muted">Article not found.</p>
        <button className="text-primary cursor-pointer mt-2" onClick={() => navigate('/mobile-header')}>
          Back to articles
        </button>
      </div>
    );
  }

  if (article.hasSubNav) {
    return <ArticleDetailWithPageNav article={article} />;
  }

  return <ArticleDetailSimple article={article} />;
}

// ── Root export (parent route — uses AnimatedOutlet for child routes) ────────

export function MobileHeaderPage() {
  return (
    <AnimatedOutlet fallback={<ArticleList />} />
  );
}
