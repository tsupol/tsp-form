import { useState } from 'react';
import { ContentPanel } from '../components/ContentPanel';
import { Pagination } from '../../components/Pagination';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export function ExamplePagination() {
  const [currentPage1, setCurrentPage1] = useState(1);
  const [currentPage2, setCurrentPage2] = useState(5);
  const [currentPage3, setCurrentPage3] = useState(1);
  const [currentPage4, setCurrentPage4] = useState(10);
  const [currentPage5, setCurrentPage5] = useState(10);
  const [currentPage6, setCurrentPage6] = useState(5);

  return (
    <div className="grid gap-4">
      <ContentPanel title="Sizes">
        <div className="border border-line bg-surface p-card space-y-4">
          <div>
            <div className="text-sm text-fg-muted mb-2">Small</div>
            <Pagination
              currentPage={currentPage1}
              totalPages={10}
              onPageChange={setCurrentPage1}
              size="sm"
            />
          </div>
          <div>
            <div className="text-sm text-fg-muted mb-2">Medium (default)</div>
            <Pagination
              currentPage={currentPage1}
              totalPages={10}
              onPageChange={setCurrentPage1}
            />
          </div>
          <div>
            <div className="text-sm text-fg-muted mb-2">Large</div>
            <Pagination
              currentPage={currentPage1}
              totalPages={10}
              onPageChange={setCurrentPage1}
              size="lg"
            />
          </div>
        </div>
      </ContentPanel>

      <ContentPanel title="Large Pagination with Many Pages">
        <div className="border border-line bg-surface p-card space-y-4">
          <div>
            <div className="text-sm text-fg-muted mb-2">Current page: {currentPage2} of 1234</div>
            <Pagination
              currentPage={currentPage2}
              totalPages={1234}
              onPageChange={setCurrentPage2}
            />
          </div>
        </div>
      </ContentPanel>

      <ContentPanel title="Without First/Last Buttons">
        <div className="border border-line bg-surface p-card space-y-4">
          <div>
            <div className="text-sm text-fg-muted mb-2">Current page: {currentPage3}</div>
            <Pagination
              currentPage={currentPage3}
              totalPages={20}
              onPageChange={setCurrentPage3}
              showFirstLast={false}
            />
          </div>
        </div>
      </ContentPanel>

      <ContentPanel title="Disabled State">
        <div className="border border-line bg-surface p-card space-y-4">
          <div>
            <div className="text-sm text-fg-muted mb-2">Disabled pagination</div>
            <Pagination
              currentPage={3}
              totalPages={10}
              onPageChange={() => {}}
              disabled
            />
          </div>
        </div>
      </ContentPanel>

      <ContentPanel title="Different Sibling Counts">
        <div className="border border-line bg-surface p-card space-y-4">
          <div>
            <div className="text-sm text-fg-muted mb-2">Sibling count: 0 (minimal) - Current page: {currentPage4}</div>
            <Pagination
              currentPage={currentPage4}
              totalPages={50}
              onPageChange={setCurrentPage4}
              siblingCount={0}
            />
          </div>
          <div>
            <div className="text-sm text-fg-muted mb-2">Sibling count: 2 (more pages visible) - Current page: {currentPage5}</div>
            <Pagination
              currentPage={currentPage5}
              totalPages={50}
              onPageChange={setCurrentPage5}
              siblingCount={2}
            />
          </div>
        </div>
      </ContentPanel>

      <ContentPanel title="Custom Icons (Lucide)">
        <div className="border border-line bg-surface p-card space-y-4">
          <div>
            <div className="text-sm text-fg-muted mb-2">Using Lucide icons</div>
            <Pagination
              currentPage={currentPage6}
              totalPages={50}
              onPageChange={setCurrentPage6}
              icons={{
                first: <ChevronsLeft size="1em" />,
                previous: <ChevronLeft size="1em" />,
                next: <ChevronRight size="1em" />,
                last: <ChevronsRight size="1em" />,
              }}
            />
          </div>
        </div>
      </ContentPanel>

      <ContentPanel title="Example with Content">
        <div className="border border-line bg-surface p-card space-y-4">
          <div className="space-y-2">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className="p-3 border border-line rounded-lg bg-surface-elevated"
              >
                Item {(currentPage1 - 1) * 5 + i + 1} on page {currentPage1}
              </div>
            ))}
          </div>
          <Pagination
            currentPage={currentPage1}
            totalPages={10}
            onPageChange={setCurrentPage1}
          />
        </div>
      </ContentPanel>
    </div>
  );
}
