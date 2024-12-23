import { NextRequest } from 'next/server';

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

interface FlavorTextEntry {
  flavor_text: string;
  language: {
    name: string;
  };
}

interface PokemonSpecies {
  url: string;
  flavor_text_entries: FlavorTextEntry[];
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
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Pokemon ID is required' }),
        { status: 400 }
      );
    }

    const pokemonId = parseInt(id);
    if (isNaN(pokemonId) || pokemonId < 1) {
      return new Response(
        JSON.stringify({ error: 'Invalid Pokemon ID' }),
        { status: 400 }
      );
    }

    // Fetch basic Pokemon data
    const pokemonResponse = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemonId}`,
      { next: { revalidate: 3600 } }
    );

    if (!pokemonResponse.ok) {
      throw new Error('Pokemon not found');
    }

    const pokemonData: PokemonResponse = await pokemonResponse.json();

    // Fetch species data for description and evolution chain
    const speciesResponse = await fetch(pokemonData.species.url);
    if (!speciesResponse.ok) {
      throw new Error('Species data not found');
    }

    const speciesData: PokemonSpecies = await speciesResponse.json();
    const description = speciesData.flavor_text_entries
      .find((entry: FlavorTextEntry) => entry.language.name === 'en')
      ?.flavor_text.replace(/\\f|\\n|\\r/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || '';

    // Fetch evolution chain
    const evolutionResponse = await fetch(speciesData.evolution_chain.url);
    if (!evolutionResponse.ok) {
      throw new Error('Evolution data not found');
    }

    const evolutionData: EvolutionChain = await evolutionResponse.json();

    // Process evolution chain
    const evolutionChain: Array<{
      id: number;
      name: string;
      sprite: string;
    }> = [];

    const processEvolutionChain = async (chain: EvolutionChainLink) => {
      const speciesUrl = chain.species.url;
      const pokemonId = parseInt(
        speciesUrl.split('/').filter(Boolean).pop() || '0'
      );

      const pokemonResponse = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${pokemonId}`
      );
      if (pokemonResponse.ok) {
        const pokemonData = await pokemonResponse.json();
        evolutionChain.push({
          id: pokemonId,
          name: chain.species.name,
          sprite:
            pokemonData.sprites.other['official-artwork'].front_default ||
            pokemonData.sprites.front_default,
        });
      }

      if (chain.evolves_to.length > 0) {
        await Promise.all(
          chain.evolves_to.map((evolution) => processEvolutionChain(evolution))
        );
      }
    };

    await processEvolutionChain(evolutionData.chain);

    // Fetch move details
    const moves = await Promise.all(
      pokemonData.moves.slice(0, 4).map(async (move) => {
        const moveResponse = await fetch(move.move.url);
        if (!moveResponse.ok) return null;
        const moveData: MoveDetail = await moveResponse.json();
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
      types: pokemonData.types.map((type) => type.type.name),
      sprite:
        pokemonData.sprites.other['official-artwork'].front_default ||
        pokemonData.sprites.front_default,
      stats: {
        hp: pokemonData.stats.find((stat) => stat.stat.name === 'hp')?.base_stat || 0,
        attack: pokemonData.stats.find((stat) => stat.stat.name === 'attack')?.base_stat || 0,
        defense: pokemonData.stats.find((stat) => stat.stat.name === 'defense')?.base_stat || 0,
        specialAttack: pokemonData.stats.find((stat) => stat.stat.name === 'special-attack')?.base_stat || 0,
        specialDefense: pokemonData.stats.find((stat) => stat.stat.name === 'special-defense')?.base_stat || 0,
        speed: pokemonData.stats.find((stat) => stat.stat.name === 'speed')?.base_stat || 0,
      },
      height: pokemonData.height,
      weight: pokemonData.weight,
      abilities: pokemonData.abilities.map((ability) => ability.ability.name),
      description,
      evolutionChain,
      moves: moves.filter((move): move is NonNullable<typeof move> => move !== null),
    };

    return new Response(JSON.stringify(formattedPokemon), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in Pokemon detail API route:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch Pokemon details' }),
      { status: 500 }
    );
  }
}
