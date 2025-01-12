'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSearchParams } from 'next/navigation';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
}

export function Searchbar({
  placeholder = 'Search...',
  onSearch,
}: SearchBarProps) {
  const searchParams = useSearchParams();
  const [query, setQuery] = React.useState('');
  const handleSearch = () => {
    onSearch(query);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  React.useEffect(() => {
    if (searchParams.get('search') !== null) {
      setQuery(searchParams.get('search') as string);
    }
  }, [searchParams]);

  return (
    <div className="flex items-center w-full">
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        onKeyUp={handleKeyPress}
        className="mr-2"
      />
      <Button onClick={handleSearch}>Search</Button>
    </div>
  );
}
