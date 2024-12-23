"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PokemonTypeFilterProps {
  selectedTypes: string[];
  onTypeSelect: (types: string[]) => void;
}

const typeColors: { [key: string]: string } = {
  bug: 'bg-lime-600 hover:bg-lime-500',
  dark: 'bg-gray-800 hover:bg-gray-700',
  dragon: 'bg-indigo-600 hover:bg-indigo-500',
  electric: 'bg-yellow-500 hover:bg-yellow-400',
  fairy: 'bg-pink-500 hover:bg-pink-400',
  fighting: 'bg-red-700 hover:bg-red-600',
  fire: 'bg-red-600 hover:bg-red-500',
  flying: 'bg-blue-400 hover:bg-blue-300',
  ghost: 'bg-purple-700 hover:bg-purple-600',
  grass: 'bg-green-600 hover:bg-green-500',
  ground: 'bg-yellow-700 hover:bg-yellow-600',
  ice: 'bg-cyan-400 hover:bg-cyan-300',
  normal: 'bg-gray-500 hover:bg-gray-400',
  poison: 'bg-purple-600 hover:bg-purple-500',
  psychic: 'bg-pink-600 hover:bg-pink-500',
  rock: 'bg-yellow-800 hover:bg-yellow-700',
  steel: 'bg-gray-600 hover:bg-gray-500',
  water: 'bg-blue-600 hover:bg-blue-500',
};

const types = Object.keys(typeColors);

const PokemonTypeFilter: React.FC<PokemonTypeFilterProps> = ({
  selectedTypes,
  onTypeSelect,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTypeClick = (type: string) => {
    if (selectedTypes.includes(type)) {
      onTypeSelect(selectedTypes.filter((t) => t !== type));
    } else {
      onTypeSelect([...selectedTypes, type]);
    }
  };

  const handleClearAll = () => {
    onTypeSelect([]);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="w-full space-y-4 font-poppins bg-gray-800 p-4 rounded-lg shadow-lg transition-all duration-300 ease-in-out">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold tracking-tight text-white">Filter by Type</h3>
        <div className="flex items-center space-x-2">
          {selectedTypes.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-md px-2 py-1"
            >
              Clear All
            </button>
          )}
          <button
            onClick={toggleExpand}
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-md px-2 py-1"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {(isExpanded || selectedTypes.length > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {types.map((type, index) => (
                <motion.button
                  key={type}
                  onClick={() => handleTypeClick(type)}
                  className={`
                    px-3 py-2 rounded-full text-white text-sm font-medium capitalize
                    transition-all duration-200 transform
                    ${typeColors[type]}
                    ${selectedTypes.includes(type) 
                      ? 'ring-2 ring-offset-2 ring-white/20 scale-105' 
                      : 'hover:scale-105'
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                  `}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  {type}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {selectedTypes.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-sm text-gray-400 font-medium"
        >
          {selectedTypes.length} type{selectedTypes.length !== 1 ? 's' : ''} selected
        </motion.p>
      )}
    </div>
  );
};

export default PokemonTypeFilter;
