"use client";

import React from 'react';

interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

interface PokemonCardProps {
  id: number;
  name: string;
  types: string[];
  sprite: string;
  stats?: PokemonStats;
  isSelected?: boolean;
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

const PokemonCard: React.FC<PokemonCardProps> = ({
  id,
  name,
  types,
  sprite,
  stats,
  isSelected = false,
}) => {
  return (
    <div
      className={`relative rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden font-poppins bg-gray-800 text-white ${
        isSelected ? 'w-full' : 'w-64'
      }`}
    >
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="40" fill="currentColor" />
          <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="4" />
          <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="4" />
          <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="4" />
        </svg>
      </div>

      {/* Card Header with ID */}
      <div className="absolute top-2 right-2 bg-black/50 rounded-full px-3 py-1">
        <span className="text-white text-sm font-medium">#{String(id).padStart(3, '0')}</span>
      </div>

      {/* Pokemon Image */}
      <div
        className={`bg-gray-700 p-4 flex justify-center items-center ${
          isSelected ? 'h-64' : 'h-48'
        }`}
      >
        <img
          src={sprite}
          alt={`${name} sprite`}
          className={`object-contain ${isSelected ? 'w-56 h-56' : 'w-40 h-40'}`}
          loading="lazy"
        />
      </div>

      {/* Pokemon Info */}
      <div className="p-4">
        <h2 className="text-xl font-bold capitalize mb-3">{name}</h2>

        {/* Types */}
        <div className="flex gap-2 mb-4">
          {types.map((type, index) => (
            <span
              key={index}
              className={`${
                typeColors[type.toLowerCase()]
              } px-3 py-1 rounded-full text-white text-sm font-medium capitalize`}
            >
              {type}
            </span>
          ))}
        </div>

        {/* Stats */}
        {stats && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-300">HP</span>
              <div className="w-2/3 bg-gray-600 rounded-full h-2">
                <div
                  className="bg-green-500 rounded-full h-2"
                  style={{ width: `${Math.min(100, (stats.hp / 255) * 100)}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-300">ATK</span>
              <div className="w-2/3 bg-gray-600 rounded-full h-2">
                <div
                  className="bg-red-500 rounded-full h-2"
                  style={{ width: `${Math.min(100, (stats.attack / 255) * 100)}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-300">DEF</span>
              <div className="w-2/3 bg-gray-600 rounded-full h-2">
                <div
                  className="bg-blue-500 rounded-full h-2"
                  style={{ width: `${Math.min(100, (stats.defense / 255) * 100)}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-300">SP. ATK</span>
              <div className="w-2/3 bg-gray-600 rounded-full h-2">
                <div
                  className="bg-yellow-500 rounded-full h-2"
                  style={{ width: `${Math.min(100, (stats.specialAttack / 255) * 100)}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-300">SP. DEF</span>
              <div className="w-2/3 bg-gray-600 rounded-full h-2">
                <div
                  className="bg-purple-500 rounded-full h-2"
                  style={{ width: `${Math.min(100, (stats.specialDefense / 255) * 100)}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-300">SPEED</span>
              <div className="w-2/3 bg-gray-600 rounded-full h-2">
                <div
                  className="bg-orange-500 rounded-full h-2"
                  style={{ width: `${Math.min(100, (stats.speed / 255) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PokemonCard;
