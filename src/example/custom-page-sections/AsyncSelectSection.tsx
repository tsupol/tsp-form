import { useState, useCallback, useRef, useEffect } from 'react';
import { Select, Option } from '../../components/Select';
import { Search } from 'lucide-react';

const MOCK_DATA: Option[] = [
  { value: '1', label: 'Alice Johnson' },
  { value: '2', label: 'Bob Smith' },
  { value: '3', label: 'Charlie Brown' },
  { value: '4', label: 'Diana Prince' },
  { value: '5', label: 'Edward Norton' },
  { value: '6', label: 'Fiona Apple' },
  { value: '7', label: 'George Lucas' },
  { value: '8', label: 'Hannah Montana' },
];

function mockFetch(query: string): Promise<Option[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        MOCK_DATA.filter((item) =>
          item.label.toLowerCase().includes(query.toLowerCase())
        )
      );
    }, 800);
  });
}

function mockFetchDefaults(): Promise<Option[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_DATA.slice(0, 4));
    }, 600);
  });
}

function mockFetchById(id: string): Promise<Option | undefined> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_DATA.find((item) => item.value === id));
    }, 500);
  });
}

// Subsequence fuzzy match: returns a score if every char of `query` appears in
// `label` in order (not necessarily adjacent). Lower score = better (tighter span).
function fuzzyScore(label: string, query: string): number | null {
  const l = label.toLowerCase();
  const q = query.toLowerCase();
  let li = 0;
  let firstMatch = -1;
  let lastMatch = -1;
  for (let qi = 0; qi < q.length; qi++) {
    const ch = q[qi];
    while (li < l.length && l[li] !== ch) li++;
    if (li === l.length) return null;
    if (firstMatch === -1) firstMatch = li;
    lastMatch = li;
    li++;
  }
  return (lastMatch - firstMatch) + firstMatch * 0.1;
}

function mockFuzzySearch(query: string): Promise<Option[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const scored = MOCK_DATA
        .map((item) => ({ item, score: fuzzyScore(item.label, query) }))
        .filter((x): x is { item: Option; score: number } => x.score !== null)
        .sort((a, b) => a.score - b.score)
        .map((x) => x.item);
      resolve(scored);
    }, 400);
  });
}

export function AsyncSelectSection() {
  const [value, setValue] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [defaultOptions, setDefaultOptions] = useState<Option[]>([]);
  const [searchResults, setSearchResults] = useState<Option[]>([]);
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

  // Simulate edit page: pre-fetch selected option on mount
  const [editValue, setEditValue] = useState<string | null>('3');
  const [editSelectedOption, setEditSelectedOption] = useState<Option | null>(null);
  const [editDefaultOptions, setEditDefaultOptions] = useState<Option[]>([]);
  const [editSearchResults, setEditSearchResults] = useState<Option[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const editDebounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const editDefaultsCacheRef = useRef<Option[] | null>(null);
  const [editInitLoading, setEditInitLoading] = useState(true);

  const fetchEditDefaults = useCallback(() => {
    if (editDefaultsCacheRef.current) {
      setEditDefaultOptions(editDefaultsCacheRef.current);
      return;
    }
    setEditLoading(true);
    mockFetchDefaults().then((results) => {
      editDefaultsCacheRef.current = results;
      setEditDefaultOptions(results);
      setEditLoading(false);
    });
  }, []);

  useEffect(() => {
    // Fetch pre-selected option and defaults on mount (edit page scenario)
    mockFetchById('3').then((option) => {
      if (option) setEditSelectedOption(option);
      setEditInitLoading(false);
    });
    fetchEditDefaults();
  }, [fetchEditDefaults]);

  const editOptions = (() => {
    const base = editSearchResults.length > 0 ? editSearchResults : editDefaultOptions;
    if (editSelectedOption && !base.some((o) => o.value === editSelectedOption.value)) {
      return [editSelectedOption, ...base];
    }
    return base;
  })();

  // Fuzzy search variant — uses filterOptions={false} so the parent's fuzzy
  // results render as-is (subsequence matches like "hmn" → "Hannah Montana"
  // would be dropped by the built-in substring filter).
  const [fuzzyValue, setFuzzyValue] = useState<string | null>(null);
  const [fuzzySelectedOption, setFuzzySelectedOption] = useState<Option | null>(null);
  const [fuzzyResults, setFuzzyResults] = useState<Option[]>(MOCK_DATA);
  const [fuzzyLoading, setFuzzyLoading] = useState(false);
  const fuzzyDebounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleFuzzySearchChange = useCallback((searchTerm: string) => {
    if (fuzzyDebounceRef.current) clearTimeout(fuzzyDebounceRef.current);
    if (searchTerm === '') {
      setFuzzyResults(MOCK_DATA);
      setFuzzyLoading(false);
      return;
    }
    setFuzzyLoading(true);
    fuzzyDebounceRef.current = setTimeout(() => {
      mockFuzzySearch(searchTerm).then((results) => {
        setFuzzyResults(results);
        setFuzzyLoading(false);
      });
    }, 200);
  }, []);

  const fuzzyOptions = (() => {
    if (fuzzySelectedOption && !fuzzyResults.some((o) => o.value === fuzzySelectedOption.value)) {
      return [fuzzySelectedOption, ...fuzzyResults];
    }
    return fuzzyResults;
  })();

  const handleSearchChange = useCallback((searchTerm: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (searchTerm.length < 3) {
      setSearchResults([]);
      setLoading(false);
      fetchDefaults();
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(() => {
      mockFetch(searchTerm).then((results) => {
        setSearchResults(results);
        setLoading(false);
      });
    }, 300);
  }, [fetchDefaults]);

  const handleEditSearchChange = useCallback((searchTerm: string) => {
    if (editDebounceRef.current) clearTimeout(editDebounceRef.current);

    if (searchTerm.length < 3) {
      setEditSearchResults([]);
      setEditLoading(false);
      fetchEditDefaults();
      return;
    }

    setEditLoading(true);
    editDebounceRef.current = setTimeout(() => {
      mockFetch(searchTerm).then((results) => {
        setEditSearchResults(results);
        setEditLoading(false);
      });
    }, 300);
  }, [fetchEditDefaults]);

  return (
    <div className="grid gap-3">
      <h2 className="text-lg font-semibold">Async Search Select</h2>
      <div className="flex flex-col">
        <label className="form-label">Search User (min 3 chars)</label>
        <Select
          id="async-user"
          options={options}
          value={value}
          onChange={(v) => {
            const val = v as string | null;
            setValue(val);
            const selected = options.find((o) => o.value === val);
            setSelectedOption(selected ?? null);
          }}
          onSearchChange={handleSearchChange}
          loading={loading}
          placeholder="Type to search..."
          showChevron={false}
          clearable
          startIcon={<Search size={16} />}
        />
      </div>
      <div className="flex flex-col">
        <label className="form-label">Edit Page (pre-fetched value)</label>
        <Select
          id="async-edit-user"
          options={editOptions}
          value={editValue}
          onChange={(v) => {
            const val = v as string | null;
            setEditValue(val);
            const selected = editOptions.find((o) => o.value === val);
            setEditSelectedOption(selected ?? null);
          }}
          onSearchChange={handleEditSearchChange}
          loading={editLoading || editInitLoading}
          placeholder="Type to search..."
        />
      </div>
      <div className="flex flex-col">
        <label className="form-label">Fuzzy Search (try "hmn", "alc", "ednrtn")</label>
        <Select
          id="async-fuzzy-user"
          options={fuzzyOptions}
          value={fuzzyValue}
          onChange={(v) => {
            const val = v as string | null;
            setFuzzyValue(val);
            const selected = fuzzyOptions.find((o) => o.value === val);
            setFuzzySelectedOption(selected ?? null);
          }}
          onSearchChange={handleFuzzySearchChange}
          filterOptions={false}
          loading={fuzzyLoading}
          placeholder="Type to fuzzy search..."
          startIcon={<Search size={16} />}
        />
      </div>
    </div>
  );
}
