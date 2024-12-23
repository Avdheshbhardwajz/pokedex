import { NextResponse } from 'next/server';

interface PokemonType {
  pokemon: {
    pokemon: {
      name: string;
      url: string;
    };
  }[];
}

interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    name: string;
    url: string;
  }[];
}

interface PokemonDetail {
  id: number;
  name: string;
  types: {
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }[];
  sprites: {
    front_default: string;
  };
  stats: {
    base_stat: number;
    effort: number;
    stat: {
      name: string;
      url: string;
    };
  }[];
}

export async function GET(request: Request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const search = searchParams.get('search') || '';
    const types = searchParams.get('types')?.split(',').filter(Boolean) || [];
    
    // First, get all Pokemon that match the type filter
    let filteredPokemon: { name: string; url: string; }[] = [];
    
    if (types.length > 0) {
      try {
        // Fetch Pokemon for each selected type
        const typePromises = types.map(type =>
          fetch(`https://pokeapi.co/api/v2/type/${type}`)
            .then(res => {
              if (!res.ok) throw new Error(`Failed to fetch type ${type}`);
              return res.json();
            })
            .then(data => data as PokemonType)
        );
        
        const typeResults = await Promise.all(typePromises);
        
        // Get Pokemon that have ALL selected types
        const pokemonByType = typeResults.map(result =>
          result.pokemon.map(p => ({
            name: p.pokemon.name,
            url: p.pokemon.url
          }))
        );
        
        // Find Pokemon that exist in all type arrays
        filteredPokemon = pokemonByType.reduce((acc, curr) =>
          acc.filter(pokemon =>
            curr.some(p => p.name === pokemon.name)
          )
        );
      } catch (error) {
        console.error('Error fetching Pokemon by type:', error);
        return NextResponse.json(
          { error: 'Failed to fetch Pokemon by type' },
          { status: 500 }
        );
      }
    } else {
      try {
        // If no type filter, get paginated list of all Pokemon
        const response = await fetch(
          'https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0'
        );
        if (!response.ok) throw new Error('Failed to fetch Pokemon list');
        
        const data = await response.json() as PokemonListResponse;
        filteredPokemon = data.results;
      } catch (error) {
        console.error('Error fetching Pokemon list:', error);
        return NextResponse.json(
          { error: 'Failed to fetch Pokemon list' },
          { status: 500 }
        );
      }
    }
    
    // Apply search filter if present
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPokemon = filteredPokemon.filter(pokemon =>
        pokemon.name.toLowerCase().includes(searchLower) ||
        pokemon.url.split('/').slice(-2, -1)[0].includes(search)
      );
    }
    
    // Calculate pagination
    const totalResults = filteredPokemon.length;
    const totalPages = Math.ceil(totalResults / limit);
    const offset = (page - 1) * limit;
    const paginatedResults = filteredPokemon.slice(offset, offset + limit);
    
    try {
      // Fetch detailed data for paginated results
      const detailedPokemonPromises = paginatedResults.map(pokemon =>
        fetch(pokemon.url)
          .then(res => {
            if (!res.ok) throw new Error(`Failed to fetch Pokemon ${pokemon.name}`);
            return res.json();
          })
          .then(data => data as PokemonDetail)
      );
      
      const detailedPokemon = await Promise.all(detailedPokemonPromises);
      
      // Format the response data
      const formattedPokemon = detailedPokemon.map(pokemon => ({
        id: pokemon.id,
        name: pokemon.name,
        types: pokemon.types.map(type => type.type.name),
        sprite: pokemon.sprites.front_default,
        stats: {
          hp: pokemon.stats[0].base_stat,
          attack: pokemon.stats[1].base_stat,
          defense: pokemon.stats[2].base_stat,
        },
      }));
      
      return NextResponse.json({
        pokemon: formattedPokemon,
        pagination: {
          total: totalResults,
          totalPages,
          currentPage: page,
          hasMore: page < totalPages,
        },
      });
    } catch (error) {
      console.error('Error fetching Pokemon details:', error);
      return NextResponse.json(
        { error: 'Failed to fetch Pokemon details' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in Pokemon API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
