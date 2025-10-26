// pokedex.js (Versão atualizada com classes de Tipo)

const pokedexContainer = document.getElementById('pokedex');

function carregarEExibirPokedex() {
    // Usa fetch() para carregar o arquivo JSON
    fetch('./pokemon.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro ao carregar o arquivo: ${response.statusText}`);
            }
            return response.json();
        })
        .then(listaPokemons => {
            const pokemonsOrdenados = listaPokemons.sort((a, b) => a.id - b.id);
            renderizarCards(pokemonsOrdenados);
        })
        .catch(error => {
            console.error("Ocorreu um erro ao carregar a Pokédex:", error);
            pokedexContainer.innerHTML = "<p style='color: red;'>Erro ao carregar dados. Verifique o console para mais detalhes.</p>";
        });
}

function renderizarCards(pokemons) {
    pokemons.forEach(pokemon => {

        const cartao = document.createElement('div');
        cartao.classList.add('pokemon-card');

        const nomeElemento = document.createElement('h2');
        nomeElemento.textContent = `#${pokemon.id} - ${pokemon.nome}`;

        const imagem = document.createElement('img');
        imagem.src = pokemon.imagem_url;
        imagem.alt = `Sprite de ${pokemon.nome}`;

        // NOVIDADE: Contêiner para os tipos
        const tiposContainer = document.createElement('div');
        tiposContainer.classList.add('tipos-container');

        // NOVIDADE: Cria um SPAN para cada tipo e aplica a classe de cor
        pokemon.tipos.forEach(tipo => {
            const spanTipo = document.createElement('span');
            // Remove acentuação e espaços para criar uma classe CSS segura (ex: type-Fogo)
            const classeTipo = tipo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, '');
            spanTipo.classList.add('tipo-badge', `tipo-${classeTipo}`);
            spanTipo.textContent = tipo;
            tiposContainer.appendChild(spanTipo);
        });

        // Adicionar ao cartão
        cartao.appendChild(nomeElemento);
        cartao.appendChild(imagem);
        cartao.appendChild(tiposContainer); // Adiciona o novo container de tipos

        pokedexContainer.appendChild(cartao);
    });
}

carregarEExibirPokedex();