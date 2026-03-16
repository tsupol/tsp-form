// ============================================================================
// PageNav — Routed Example (search params)
//
// This example uses URL search params (?lesson=3) to persist the selected
// detail across page refreshes. On mobile, PageNav's slide animation handles
// panel transitions while the URL stays in sync.
//
// Key patterns for routed PageNav:
//   1. Read selection from searchParams, not local state.
//   2. Set defaultPanel based on whether a param exists on mount — this
//      ensures a refresh on the detail panel starts on the correct panel.
//   3. When navigating to a child: set the search param + call goTo().
//   4. When going back: clear the search param + call goBack().
//   5. Build your own header — PageNav provides goBack/isRoot/isMobile
//      but no built-in Header, so you have full control over icons, layout,
//      and behavior (e.g. router back vs goBack).
//
// See PageNavTablePage for a non-routed (useState-only) example.
// ============================================================================

import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageNav, PageNavPanel } from '../../components/PageNav';
import { clsx } from 'clsx';
import { ArrowLeft, ArrowRightFromLine } from 'lucide-react';

type Lesson = {
  id: number;
  title: string;
  description: string;
  duration: string;
  content: string;
};

const lessons: Lesson[] = [
  { id: 1, title: 'Introduction to React', description: 'Learn the basics of React', duration: '15 min', content: 'React is a JavaScript library for building user interfaces. It lets you compose complex UIs from small and isolated pieces of code called "components".\n\nIn this lesson, we will cover:\n- What is React?\n- Why use React?\n- Setting up your first project\n- Understanding JSX\n- Components and props' },
  { id: 2, title: 'Components & Props', description: 'Understanding component architecture', duration: '20 min', content: 'Components let you split the UI into independent, reusable pieces. They accept inputs called "props" and return React elements describing what should appear on the screen.\n\nTopics covered:\n- Function components\n- Class components\n- Props and default props\n- Children prop\n- Composition vs inheritance' },
  { id: 3, title: 'State & Lifecycle', description: 'Managing component state', duration: '25 min', content: 'State is similar to props, but it is private and fully controlled by the component. When state changes, the component re-renders.\n\nTopics covered:\n- useState hook\n- State updates\n- Lifecycle with useEffect\n- Cleanup functions\n- Dependencies array' },
  { id: 4, title: 'Hooks Deep Dive', description: 'Advanced hook patterns', duration: '30 min', content: 'Hooks let you use state and other React features without writing a class. They are functions that let you "hook into" React state and lifecycle.\n\nTopics covered:\n- useCallback and useMemo\n- useRef\n- useContext\n- Custom hooks\n- Rules of hooks' },
  { id: 5, title: 'Routing & Navigation', description: 'Client-side routing with React Router', duration: '20 min', content: 'React Router enables navigation among views of various components in a React Application.\n\nTopics covered:\n- BrowserRouter setup\n- Route and Routes\n- Link and NavLink\n- URL parameters\n- Nested routes' },
  { id: 6, title: 'Forms & Validation', description: 'Building forms with react-hook-form', duration: '25 min', content: 'React Hook Form is a performant library for managing form state and validation.\n\nTopics covered:\n- useForm hook\n- Registering inputs\n- Validation rules\n- Error handling\n- Form submission' },
  { id: 7, title: 'Performance Optimization', description: 'Techniques for faster React apps', duration: '30 min', content: 'Optimizing React applications requires understanding how React renders and updates the DOM.\n\nTopics covered:\n- React.memo and shouldComponentUpdate\n- useMemo and useCallback\n- Code splitting with lazy and Suspense\n- Virtualized lists\n- Profiling with React DevTools' },
  { id: 8, title: 'Testing React Apps', description: 'Unit and integration testing strategies', duration: '25 min', content: 'Testing ensures your components work correctly and helps prevent regressions as your codebase grows.\n\nTopics covered:\n- Jest and React Testing Library\n- Rendering components in tests\n- Simulating user interactions\n- Mocking API calls\n- Snapshot testing' },
];

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

function LessonList({ selectedId, onSelect, filter, onFilterChange }: {
  selectedId: number | null;
  onSelect: (l: Lesson) => void;
  filter: string;
  onFilterChange: (v: string) => void;
}) {
  const filtered = lessons.filter(
    (l) => l.title.toLowerCase().includes(filter.toLowerCase()) || l.description.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-line shrink-0">
        <input
          type="text"
          placeholder="Filter lessons..."
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-line bg-surface text-sm outline-none focus:border-primary"
        />
      </div>
      <div className="flex-1 overflow-y-auto better-scroll">
        {filtered.map((lesson) => (
          <button
            key={lesson.id}
            className={clsx(
              'text-left px-4 py-8 border-b border-line transition-colors cursor-pointer w-full',
              selectedId === lesson.id ? 'bg-primary/10' : 'hover:bg-surface-hover'
            )}
            onClick={() => onSelect(lesson)}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-medium shrink-0">
                {lesson.id}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{lesson.title}</div>
                <div className="text-sm opacity-60 truncate">{lesson.description}</div>
              </div>
              <span className="text-xs opacity-40 shrink-0">{lesson.duration}</span>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center opacity-40">No lessons found</div>
        )}
      </div>
    </div>
  );
}

function LessonContent({ lesson }: { lesson: Lesson | null }) {
  if (!lesson) {
    return (
      <div className="flex items-center justify-center h-full opacity-40">
        <p>Select a lesson to begin</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-medium">
          {lesson.id}
        </div>
        <div>
          <h2 className="text-lg font-semibold">{lesson.title}</h2>
          <p className="text-sm opacity-60">{lesson.duration}</p>
        </div>
      </div>
      {lesson.content.split('\n\n').map((paragraph, i) => (
        <div key={i} className="mb-4">
          {paragraph.startsWith('- ') || paragraph.includes('\n- ') ? (
            <ul className="list-disc pl-5 space-y-1">
              {paragraph.split('\n').filter(l => l.startsWith('- ')).map((line, j) => (
                <li key={j} className="opacity-80">{line.slice(2)}</li>
              ))}
            </ul>
          ) : (
            <p className="opacity-80 leading-relaxed">{paragraph}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export function PageNavPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('lesson') ? Number(searchParams.get('lesson')) : null;
  const selectedLesson = selectedId ? lessons.find(l => l.id === selectedId) ?? null : null;
  const [filter, setFilter] = useState('');

  // Refs to call goTo from outside the render prop
  const goToRef = useRef<(id: string) => void>();
  const isMobileRef = useRef(false);

  const selectLesson = (lesson: Lesson) => {
    setSearchParams({ lesson: String(lesson.id) }, { replace: true });
    if (isMobileRef.current) goToRef.current?.('detail');
  };

  const handleBack = (goBack: () => void) => {
    // Clear the search param and navigate PageNav back to the list panel
    setSearchParams({}, { replace: true });
    goBack();
  };

  // If ?lesson= is present on mount (e.g. page refresh), start on detail panel
  const initialPanel = selectedId ? 'detail' : 'list';

  return (
    <PageNav panels={['list', 'detail']} defaultPanel={initialPanel} mobileBreakpoint={768} className="h-dvh">
      {({ isMobile, isRoot, goTo, goBack }) => {
        goToRef.current = goTo;
        isMobileRef.current = isMobile;

        return (
          <>
            {isMobile && (
              <div className="pagenav-header">
                <div className="pagenav-header-start">
                  {isRoot ? (
                    <MenuToggleButton />
                  ) : (
                    <button className="pagenav-back-btn" onClick={() => handleBack(goBack)} aria-label="Go back">
                      <ArrowLeft size={20} />
                    </button>
                  )}
                </div>
                <div className="pagenav-header-title">{isRoot ? 'Lessons' : selectedLesson?.title}</div>
              </div>
            )}
            {!isMobile && (
              <div className="px-6 py-4 border-b border-line">
                <h1 className="heading-1">Lessons</h1>
                <p className="text-muted">Select a lesson to view its content. Selection persists in the URL.</p>
              </div>
            )}
            <div className={isMobile ? 'pagenav-panels' : 'flex flex-1 min-h-0'}>
              <PageNavPanel id="list" className="w-80 border-r border-line">
                <LessonList
                  selectedId={selectedId}
                  filter={filter}
                  onFilterChange={setFilter}
                  onSelect={selectLesson}
                />
              </PageNavPanel>
              <PageNavPanel id="detail" className="flex-1 overflow-y-auto better-scroll">
                <LessonContent lesson={selectedLesson} />
              </PageNavPanel>
            </div>
          </>
        );
      }}
    </PageNav>
  );
}
