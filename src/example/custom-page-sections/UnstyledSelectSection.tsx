import { useState, useCallback, useRef, useEffect } from 'react';
import { Select, Option } from '../../components/Select';
import { Code, ChevronDown } from 'lucide-react';
import './unstyled-select.css';

const MOCK_FRAMEWORKS: Option[] = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'SolidJS' },
  { value: 'preact', label: 'Preact' },
  { value: 'next', label: 'Next.js' },
  { value: 'nuxt', label: 'Nuxt' },
];

function mockFetch(query: string): Promise<Option[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        MOCK_FRAMEWORKS.filter((item) =>
          item.label.toLowerCase().includes(query.toLowerCase())
        )
      );
    }, 800);
  });
}

function mockFetchDefaults(): Promise<Option[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_FRAMEWORKS.slice(0, 4));
    }, 600);
  });
}

export function UnstyledSelectSection() {
  const [value, setValue] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [defaultOptions, setDefaultOptions] = useState<Option[]>([]);
  const [searchResults, setSearchResults] = useState<Option[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const defaultsCacheRef = useRef<Option[] | null>(null);

  const fetchDefaults = useCallback(() => {
    if (defaultsCacheRef.current) {
      setDefaultOptions(defaultsCacheRef.current);
      return;
    }
    setLoading(true);
    mockFetchDefaults().then((results) => {
      defaultsCacheRef.current = results;
      setDefaultOptions(results);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchDefaults();
  }, [fetchDefaults]);

  const options = (() => {
    const base = searchResults.length > 0 ? searchResults : defaultOptions;
    if (selectedOption && !base.some((o) => o.value === selectedOption.value)) {
      return [selectedOption, ...base];
    }
    return base;
  })();

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (term.length < 3) {
      setSearchResults([]);
      setLoading(false);
      fetchDefaults();
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(() => {
      mockFetch(term).then((results) => {
        setSearchResults(results);
        setLoading(false);
      });
    }, 300);
  }, [fetchDefaults]);

  return (
    <div className="grid gap-3">
      <h2 className="text-lg font-semibold">Unstyled Select</h2>
      <div className="flex flex-col gap-1">
        <label className="form-label">Pick a framework (min 3 chars)</label>
        <Select
          unstyled
          options={options}
          value={value}
          onChange={(v) => {
            const val = v as string | null;
            setValue(val);
            const selected = options.find((o) => o.value === val);
            setSelectedOption(selected ?? null);
            setSearchTerm('');
          }}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          loading={loading}
          className="custom-select-trigger"
        >
          <div className="custom-select-display">
            <div className="custom-select-icon-wrapper">
              <Code size={16} />
            </div>
            <div className="custom-select-text">
              <span className="custom-select-text-label">Framework</span>
              <span className={`custom-select-text-value ${!searchTerm && !selectedOption ? 'placeholder' : ''}`}>
                {searchTerm || selectedOption?.label || 'Type to search...'}
              </span>
            </div>
            <ChevronDown size={16} className="custom-select-chevron" />
          </div>
        </Select>
      </div>
    </div>
  );
}
