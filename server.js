const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

// Mapa para traduzir os tipos da PokeAPI (Inglês) para o seu padrão (Português)
// Isso garante que seus fundos e CSS continuem funcionando!
const typeTranslations = {
    grass: 'Grama', poison: 'Venenoso', fire: 'Fogo', flying: 'Voador',
    water: 'Água', bug: 'Inseto', normal: 'Normal', electric: 'Elétrico',
    ground: 'Terra', fairy: 'Fada', fighting: 'Lutador', psychic: 'Psíquico',
    rock: 'Pedra', steel: 'Aço', ice: 'Gelo', ghost: 'Fantasma',
    dragon: 'Dragão', dark: 'Sombrio'
};

// Isso "serve aos" arquivos HTML, CSS, JS e imagens direto pelo servidor!
app.use(express.static(__dirname));

// Mapa para traduzir os nomes das estatísticas
const statTranslations = {
    'hp': 'hp', 'attack': 'ataque', 'defense': 'defesa',
    'special-attack': 'ataque_especial', 'special-defense': 'defesa_especial',
    'speed': 'velocidade'
};

// Função auxiliar para formatar o Pokémon no seu padrão JSON
const formatPokemon = (data, speciesData = null) => {
    const tipos = data.types.map(t => typeTranslations[t.type.name] || t.type.name);

    // Pega a descrição em inglês (a PokeAPI nem sempre tem PT-BR completo nas gerações antigas)
    // Se quiser, podemos tentar filtrar por 'language.name === "en"'
    let descricao = "Descrição não disponível.";
    if (speciesData) {
        const entry = speciesData.flavor_text_entries.find(e => e.language.name === 'en');
        if (entry) descricao = entry.flavor_text.replace(/[\f\n\r]/g, ' '); // Remove quebras de linha estranhas
    }

    // Mapeia stats
    const stats = {};
    data.stats.forEach(s => {
        const nomeFormatado = statTranslations[s.stat.name];
        if (nomeFormatado) stats[nomeFormatado] = s.base_stat;
    });

    return {
        id: data.id,
        nome: data.name.charAt(0).toUpperCase() + data.name.slice(1), // Primeira letra maiúscula
        tipos: tipos,
        altura_m: data.height / 10, // PokeAPI retorna em decímetros
        peso_kg: data.weight / 10,  // PokeAPI retorna em hectogramas
        habilidades: data.abilities.map(a => ({
            nome: a.ability.name,
            escondida: a.is_hidden
        })),
        estatisticas_base: stats,
        descricao: descricao,
        // Usando a imagem oficial de alta qualidade
        imagem_url: data.sprites.other['official-artwork'].front_default
    };
};


// Tabela de Gerações (Offset = onde começa, Limit = quantos pegar)
const GENERATIONS = {
    1: { offset: 0, limit: 151 },
    2: { offset: 151, limit: 100 },
    3: { offset: 251, limit: 135 },
    4: { offset: 386, limit: 107 },
    5: { offset: 493, limit: 156 },
    6: { offset: 649, limit: 72 },
    7: { offset: 721, limit: 88 },
    8: { offset: 809, limit: 96 },
    9: { offset: 905, limit: 120 }
};

// Listar Pokémons
app.get('/pokemons', async (req, res) => {
    try {
        // Pega o parâmetro 'gen' da URL (ex: /pokemons?gen=2)
        const gen = req.query.gen;

        let limit = 151; // Padrão: Geração 1
        let offset = 0;

        // Se o usuário pediu uma geração válida, usa os dados dela
        if (gen && GENERATIONS[gen]) {
            limit = GENERATIONS[gen].limit;
            offset = GENERATIONS[gen].offset;
        }

        console.log(`Buscando Geração ${gen || 1} (Limit: ${limit}, Offset: ${offset})`);

        // Passamos o limit e offset dinâmicos para a PokeAPI
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);

        const promises = response.data.results.map(p => axios.get(p.url));
        const results = await Promise.all(promises);

        const formattedList = results.map(r => formatPokemon(r.data));

        res.json(formattedList);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao buscar pokémons');
    }
});


// Listar Pokémons (para a Home)
// Limitamos a 20 para não ficar lento
app.get('/pokemons', async (req, res) => {
    try {
        const limit = 50; // Quantos pokemons carregar na home
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);

        // A lista inicial só tem nome e URL. É preciso buscar os detalhes de CADA um
        // para pegar a imagem e os tipos para o card.
        const promises = response.data.results.map(p => axios.get(p.url));
        const results = await Promise.all(promises);

        const formattedList = results.map(r => formatPokemon(r.data));

        res.json(formattedList);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao buscar pokémons');
    }
});

//  Detalhes do Pokémon (para o dentroPokemon)
app.get('/pokemons/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Buscamos os dados básicos E os dados da espécie (para pegar a descrição)
        const [pokemonRes, speciesRes] = await Promise.all([
            axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`),
            axios.get(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
        ]);

        const pokemonFormatado = formatPokemon(pokemonRes.data, speciesRes.data);
        res.json(pokemonFormatado);

    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao buscar detalhes do pokémon');
    }
});

app.listen(8080, () => {
    console.log('Servidor rodando na porta 8080');
});