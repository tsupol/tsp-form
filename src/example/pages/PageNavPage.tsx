import { useState } from 'react';
import { PageNav, PageNavPanel } from '../../components/PageNav';
import { clsx } from 'clsx';
import { Menu } from 'lucide-react';

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
];

function HamburgerButton() {
  return (
    <button
      className="w-10 h-10 flex items-center justify-center hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
      aria-label="Open menu"
      onClick={() => window.dispatchEvent(new CustomEvent('sidemenu:open'))}
    >
      <Menu size={20} />
    </button>
  );
}

function LessonList({ selected, onSelect }: { selected: Lesson | null; onSelect: (l: Lesson) => void }) {
  return (
    <div className="flex flex-col">
      {lessons.map((lesson) => (
        <button
          key={lesson.id}
          className={clsx(
            'text-left px-4 py-3 border-b border-line transition-colors cursor-pointer',
            selected?.id === lesson.id ? 'bg-primary/10' : 'hover:bg-surface-hover'
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
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  return (
    <PageNav panels={['list', 'detail']} mobileBreakpoint={768} className="h-dvh">
      {({ isMobile, isRoot, goTo, Header }) => (
        <>
          {isMobile && (
            <Header
              title={isRoot ? 'Lessons' : selectedLesson?.title}
              startContent={isRoot ? <HamburgerButton /> : undefined}
            />
          )}
          {!isMobile && (
            <div className="px-6 py-4 border-b border-line">
              <h1 className="heading-1">Lessons</h1>
              <p className="text-muted">Select a lesson to view its content.</p>
            </div>
          )}
          <div className={isMobile ? 'pagenav-panels' : 'flex flex-1 min-h-0'}>
            <PageNavPanel id="list" className="w-80 border-r border-line overflow-y-auto better-scroll">
              <LessonList
                selected={selectedLesson}
                onSelect={(l) => {
                  setSelectedLesson(l);
                  if (isMobile) goTo('detail');
                }}
              />
            </PageNavPanel>
            <PageNavPanel id="detail" className="flex-1 overflow-y-auto better-scroll">
              <LessonContent lesson={selectedLesson} />
            </PageNavPanel>
          </div>
        </>
      )}
    </PageNav>
  );
}
