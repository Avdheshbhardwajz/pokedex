import { NextRequest, NextResponse } from 'next/server';

interface PokemonType {
  type: {
    name: string;
    url: string;
  };
}

interface PokemonStat {
  base_stat: number;
  stat: {
    name: string;
  };
}

interface PokemonSprites {
  front_default: string;
  other: {
    'official-artwork': {
      front_default: string;
    };
  };
}

interface PokemonSpecies {
  url: string;
  flavor_text_entries: Array<{
    flavor_text: string;
    language: {
      name: string;
    };
  }>;
  evolution_chain: {
    url: string;
  };
}

interface PokemonAbility {
  ability: {
    name: string;
  };
}

interface PokemonMove {
  move: {
    name: string;
    url: string;
  };
}

interface MoveDetail {
  name: string;
  type: {
    name: string;
  };
  power: number | null;
  accuracy: number | null;
}

interface EvolutionChainLink {
  species: {
    name: string;
    url: string;
  };
  evolves_to: EvolutionChainLink[];
}

interface EvolutionChain {
  chain: EvolutionChainLink;
}

interface PokemonResponse {
  id: number;
  name: string;
  types: PokemonType[];
  sprites: PokemonSprites;
  stats: PokemonStat[];
  species: PokemonSpecies;
  abilities: PokemonAbility[];
  moves: PokemonMove[];
  height: number;
  weight: number;
}

interface FormattedPokemon {
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
  evolutionChain: Array<{
    id: number;
    name: string;
    sprite: string;
  }>;
  moves: Array<{
    name: string;
    type: string;
    power: number | null;
    accuracy: number | null;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Record<string, string> }
) {
  try {
    // Validate and parse ID
    const id = params?.id;
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Pokemon ID is required' },
        { status: 400 }
      );
    }

    const pokemonId = parseInt(id);
    if (isNaN(pokemonId) || pokemonId < 1) {
      return NextResponse.json(
        { error: 'Invalid Pokemon ID' },
        { status: 400 }
      );
    }

    // Fetch basic Pokemon data
    const pokemonResponse = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemonId}`
    );
    if (!pokemonResponse.ok) {
      throw new Error('Pokemon not found');
    }
    const pokemonData = (await pokemonResponse.json()) as PokemonResponse;

    // Fetch species data for description and evolution chain
    const speciesResponse = await fetch(pokemonData.species.url);
    if (!speciesResponse.ok) {
      throw new Error('Species data not found');
    }
    const speciesData = (await speciesResponse.json()) as PokemonSpecies;

    // Get English description
    const description = speciesData.flavor_text_entries
      .find(entry => entry.language.name === 'en')
      ?.flavor_text.replace(/\\f|\\n/g, ' ') || '';

    // Fetch evolution chain
    const evolutionResponse = await fetch(speciesData.evolution_chain.url);
    if (!evolutionResponse.ok) {
      throw new Error('Evolution data not found');
    }
    const evolutionData = (await evolutionResponse.json()) as EvolutionChain;

    // Process evolution chain
    const evolutionChain: FormattedPokemon['evolutionChain'] = [];
    let evoData: EvolutionChainLink | undefined = evolutionData.chain;
    
    while (evoData) {
      if (evoData.species) {
        const speciesId = evoData.species.url.split('/').slice(-2, -1)[0];
        const pokemonResponse = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${speciesId}`
        );
        if (pokemonResponse.ok) {
          const pokemonData = (await pokemonResponse.json()) as PokemonResponse;
          evolutionChain.push({
            id: parseInt(speciesId),
            name: evoData.species.name,
            sprite: pokemonData.sprites.front_default,
          });
        }
      }
      evoData = evoData.evolves_to[0];
    }

    // Format moves data
    const moves = await Promise.all(
      pokemonData.moves
        .slice(0, 12) // Limit to 12 moves for performance
        .map(async (move) => {
          const moveResponse = await fetch(move.move.url);
          if (!moveResponse.ok) return null;
          const moveData = (await moveResponse.json()) as MoveDetail;
          return {
            name: moveData.name,
            type: moveData.type.name,
            power: moveData.power,
            accuracy: moveData.accuracy,
          };
        })
    );

    // Format the response
    const formattedPokemon: FormattedPokemon = {
      id: pokemonData.id,
      name: pokemonData.name,
      types: pokemonData.types.map(type => type.type.name),
      sprite: pokemonData.sprites.other['official-artwork'].front_default || 
              pokemonData.sprites.front_default,
      stats: {
        hp: pokemonData.stats[0].base_stat,
        attack: pokemonData.stats[1].base_stat,
        defense: pokemonData.stats[2].base_stat,
        specialAttack: pokemonData.stats[3].base_stat,
        specialDefense: pokemonData.stats[4].base_stat,
        speed: pokemonData.stats[5].base_stat,
      },
      height: pokemonData.height,
      weight: pokemonData.weight,
      abilities: pokemonData.abilities.map(ability => ability.ability.name),
      description,
      evolutionChain,
      moves: moves.filter((move): move is NonNullable<typeof move> => move !== null),
    };

    return NextResponse.json(formattedPokemon);
  } catch (error) {
    console.error('Error in Pokemon detail API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Pokemon details' },
      { status: 500 }
    );
  }
}
