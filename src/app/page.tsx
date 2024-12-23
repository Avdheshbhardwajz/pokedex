"use client";

//import { useState, useEffect } from "react";
import PokedexGrid from "@/components/PokedexGrid";
//import PokemonCard from "@/components/PokemonCard";

// interface Pokemon {
//   id: number;
//   name: string;
//   types: string[];
//   sprite: string;
//   stats: {
//     hp: number;
//     attack: number;
//     defense: number;
//   };
// }

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Pokédex</h1>
        <PokedexGrid />
      </div>
    </main>
  );
}
