import { useState, useCallback, useRef, useEffect } from 'react';
import { Select, Option } from '../../../components/Select';

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
      <div className="flex flex-col gap-1">
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
        />
      </div>
      <div className="flex flex-col gap-1">
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
    </div>
  );
}
