"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { useRouter } from 'next/navigation';
import PokemonCard from './PokemonCard';
import PokemonTypeFilter from './PokemonTypeFilter';

interface Pokemon {
  id: number;
  name: string;
  types: string[];
  sprite: string;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
}

interface PaginationData {
  total: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
}

const PokedexGrid: React.FC = () => {
  const router = useRouter();
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'type'>('id');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    hasMore: true,
  });

  // Fetch Pokemon data with filters
  const fetchPokemonData = useCallback(async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: searchTerm,
        types: selectedTypes.join(','),
      });

      const response = await fetch(`/api/pokemon?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch Pokemon');
      }

      const data = await response.json();
      setPokemon(prevPokemon => (page === 1 ? data.pokemon : [...prevPokemon, ...data.pokemon]));
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching Pokemon:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchTerm, selectedTypes]);

  // Fetch Pokemon when filters change
  useEffect(() => {
    fetchPokemonData();
  }, [fetchPokemonData]);

  // Debounced search handler
  const debouncedSearch = debounce((value: string) => {
    setSearchTerm(value);
    setPage(1);
  }, 300);

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  // Handle sort change
  const handleSort = (sortType: 'id' | 'name' | 'type') => {
    setSortBy(sortType);
    const sorted = [...pokemon].sort((a, b) => {
      switch (sortType) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.types[0].localeCompare(b.types[0]);
        default:
          return a.id - b.id;
      }
    });
    setPokemon(sorted);
  };

  // Handle infinite scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (
      !isLoading &&
      pagination.hasMore &&
      scrollHeight - scrollTop <= clientHeight + 100
    ) {
      setPage(prev => prev + 1);
    }
  };

  const handlePokemonClick = (id: number) => {
    router.push(`/pokemon/${id}`);
  };

  return (
    <div className="relative min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          className="w-full h-full"
        >
          <circle cx="50" cy="50" r="40" fill="currentColor" />
          <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="4" />
          <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="4" />
          <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="4" />
        </svg>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto space-y-6 font-poppins">
        <div className="grid gap-6 md:grid-cols-[2fr_1fr] lg:grid-cols-[3fr_1fr]">
          {/* Search and filters section */}
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Search Pokémon..."
              onChange={handleSearch}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-600 bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base font-medium placeholder:text-gray-400 text-white"
            />
            <PokemonTypeFilter
              selectedTypes={selectedTypes}
              onTypeSelect={(types) => {
                setSelectedTypes(types);
                setPage(1);
              }}
            />
          </div>

          {/* View mode and sort controls */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 md:justify-end">
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value as 'id' | 'name' | 'type')}
              className="px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium text-white"
            >
              <option value="id">Sort by ID</option>
              <option value="name">Sort by Name</option>
              <option value="type">Sort by Type</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && pokemon.length === 0 && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* No results */}
        {!isLoading && pokemon.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-lg font-medium">No Pokémon found</p>
          </div>
        )}

        {/* Pokemon Grid/List */}
        <div
          onScroll={handleScroll}
          className="h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
        >
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }
          >
            {pokemon.map((pokemon) => (
              <div
                key={pokemon.id}
                onClick={() => handlePokemonClick(pokemon.id)}
                className={`cursor-pointer transform transition-transform duration-200 ${
                  viewMode === 'grid' ? 'hover:scale-105' : 'hover:bg-gray-800'
                }`}
              >
                <PokemonCard {...pokemon} />
              </div>
            ))}
          </div>

          {/* Loading more indicator */}
          {isLoading && pokemon.length > 0 && (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PokedexGrid;
