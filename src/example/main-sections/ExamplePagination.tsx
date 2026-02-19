import { useState } from 'react';
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
    <div className="page-content grid gap-4">
      <section>
        <h3 className="heading-3 mb-3">Sizes</h3>
        <div className="card space-y-4">
          <div>
            <div className="text-sm text-muted mb-2">Extra Small</div>
            <Pagination
              currentPage={currentPage1}
              totalPages={10}
              onPageChange={setCurrentPage1}
              size="xs"
            />
          </div>
          <div>
            <div className="text-sm text-muted mb-2">Small</div>
            <Pagination
              currentPage={currentPage1}
              totalPages={10}
              onPageChange={setCurrentPage1}
              size="sm"
            />
          </div>
          <div>
            <div className="text-sm text-muted mb-2">Medium (default)</div>
            <Pagination
              currentPage={currentPage1}
              totalPages={10}
              onPageChange={setCurrentPage1}
            />
          </div>
          <div>
            <div className="text-sm text-muted mb-2">Large</div>
            <Pagination
              currentPage={currentPage1}
              totalPages={10}
              onPageChange={setCurrentPage1}
              size="lg"
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="heading-3 mb-3">Large Pagination with Many Pages</h3>
        <div className="card space-y-4">
          <div>
            <div className="text-sm text-muted mb-2">Current page: {currentPage2} of 1234</div>
            <Pagination
              currentPage={currentPage2}
              totalPages={1234}
              onPageChange={setCurrentPage2}
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="heading-3 mb-3">Without First/Last Buttons</h3>
        <div className="card space-y-4">
          <div>
            <div className="text-sm text-muted mb-2">Current page: {currentPage3}</div>
            <Pagination
              currentPage={currentPage3}
              totalPages={20}
              onPageChange={setCurrentPage3}
              showFirstLast={false}
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="heading-3 mb-3">Disabled State</h3>
        <div className="card space-y-4">
          <div>
            <div className="text-sm text-muted mb-2">Disabled pagination</div>
            <Pagination
              currentPage={3}
              totalPages={10}
              onPageChange={() => {}}
              disabled
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="heading-3 mb-3">Different Sibling Counts</h3>
        <div className="card space-y-4">
          <div>
            <div className="text-sm text-muted mb-2">Sibling count: 0 (minimal) - Current page: {currentPage4}</div>
            <Pagination
              currentPage={currentPage4}
              totalPages={50}
              onPageChange={setCurrentPage4}
              siblingCount={0}
            />
          </div>
          <div>
            <div className="text-sm text-muted mb-2">Sibling count: 2 (more pages visible) - Current page: {currentPage5}</div>
            <Pagination
              currentPage={currentPage5}
              totalPages={50}
              onPageChange={setCurrentPage5}
              siblingCount={2}
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="heading-3 mb-3">Custom Icons (Lucide)</h3>
        <div className="card space-y-4">
          <div>
            <div className="text-sm text-muted mb-2">Using Lucide icons</div>
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
      </section>

      <section>
        <h3 className="heading-3 mb-3">Example with Content</h3>
        <div className="card space-y-4">
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
      </section>
    </div>
  );
}
