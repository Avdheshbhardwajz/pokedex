"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PokemonDetail {
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
  height: number;
  weight: number;
  abilities: string[];
  description: string;
  evolutionChain: {
    id: number;
    name: string;
    sprite: string;
  }[];
  moves: {
    name: string;
    type: string;
    power: number;
    accuracy: number;
  }[];
}

const typeColors: { [key: string]: string } = {
  bug: 'bg-lime-600',
  dark: 'bg-gray-800',
  dragon: 'bg-indigo-600',
  electric: 'bg-yellow-500',
  fairy: 'bg-pink-500',
  fighting: 'bg-red-700',
  fire: 'bg-red-600',
  flying: 'bg-blue-400',
  ghost: 'bg-purple-700',
  grass: 'bg-green-600',
  ground: 'bg-yellow-700',
  ice: 'bg-cyan-400',
  normal: 'bg-gray-500',
  poison: 'bg-purple-600',
  psychic: 'bg-pink-600',
  rock: 'bg-yellow-800',
  steel: 'bg-gray-600',
  water: 'bg-blue-600',
};

export default function PokemonDetailPage({ params }: { params: { id: string } }) {
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPokemonDetail = async () => {
      try {
        const id = params?.id;
        if (!id) return;
        
        const response = await fetch(`/api/pokemon/${id}`);
        if (!response.ok) throw new Error('Failed to fetch Pokemon details');
        const data = await response.json();
        setPokemon(data);
      } catch (error) {
        console.error('Error fetching Pokemon details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPokemonDetail();
  }, [params?.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!pokemon) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Pokemon not found</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <button
        onClick={() => router.back()}
        className="mb-8 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
      >
        ← Back to Pokedex
      </button>

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-bold capitalize">{pokemon.name}</h1>
              <span className="text-2xl text-gray-400">#{String(pokemon.id).padStart(3, '0')}</span>
            </div>
            
            <div className="flex gap-3">
              {pokemon.types.map((type) => (
                <span
                  key={type}
                  className={`${
                    typeColors[type.toLowerCase()]
                  } px-4 py-1.5 rounded-full text-white text-sm font-medium capitalize`}
                >
                  {type}
                </span>
              ))}
            </div>

            <p className="text-lg text-gray-300">{pokemon.description}</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <span className="text-gray-400">Height</span>
                <p className="text-xl font-semibold">{pokemon.height / 10}m</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <span className="text-gray-400">Weight</span>
                <p className="text-xl font-semibold">{pokemon.weight / 10}kg</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold mb-3">Abilities</h3>
              <div className="flex flex-wrap gap-2">
                {pokemon.abilities.map((ability) => (
                  <span
                    key={ability}
                    className="px-3 py-1 bg-gray-800 rounded-full text-sm capitalize"
                  >
                    {ability}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-8 flex items-center justify-center">
            <img
              src={pokemon.sprite}
              alt={pokemon.name}
              className="w-80 h-80 object-contain"
            />
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Base Stats</h2>
          <div className="grid gap-4">
            {Object.entries(pokemon.stats).map(([stat, value]) => (
              <div key={stat} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300 capitalize">
                    {stat.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="font-semibold">{value}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 rounded-full h-2"
                    style={{ width: `${Math.min(100, (value / 255) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evolution Chain */}
        {pokemon.evolutionChain.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Evolution Chain</h2>
            <div className="flex items-center justify-center gap-8">
              {pokemon.evolutionChain.map((evo, index) => (
                <React.Fragment key={evo.id}>
                  {index > 0 && <span className="text-3xl text-gray-500">→</span>}
                  <div
                    className="bg-gray-800 p-4 rounded-xl cursor-pointer hover:bg-gray-700 transition-colors"
                    onClick={() => router.push(`/pokemon/${evo.id}`)}
                  >
                    <img
                      src={evo.sprite}
                      alt={evo.name}
                      className="w-32 h-32 object-contain"
                    />
                    <p className="text-center mt-2 capitalize">{evo.name}</p>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Moves Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Moves</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pokemon.moves.map((move) => (
              <div key={move.name} className="bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold capitalize">{move.name.replace('-', ' ')}</h3>
                  <span
                    className={`${
                      typeColors[move.type.toLowerCase()]
                    } px-2 py-0.5 rounded text-xs capitalize`}
                  >
                    {move.type}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                  <div>Power: {move.power || '-'}</div>
                  <div>Accuracy: {move.accuracy || '-'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
