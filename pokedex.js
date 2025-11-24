let POKEMONS = [];
        let ALL_POKEMONS = [];
        let isShowingFavorites = false;
        let hideTimeout;

        // FUNÇÕES DO LOCALSTORAGE
        const FAVORITES_KEY = 'pokedex-favoritos';
        const RECENT_SEARCHES_KEY = 'pokedex-recent-searches';
        const MAX_RECENT_SEARCHES = 5; // Limite de itens a serem mostrados

        // Redireciona para a página de detalhes com o ID do Pokémon.
        function openPokemonDetails(pokemonId) {
            window.location.href = `dentroPokemon.html?id=${pokemonId}`;
        }

        function getFavoritos() {
            const favoritosString = localStorage.getItem(FAVORITES_KEY);
            if (favoritosString) {
                try {
                    return JSON.parse(favoritosString);
                } catch (e) {
                    return [];
                }
            }
            return [];
        }

        function saveFavoritos(favoritosArray) {
            const favoritosString = JSON.stringify(favoritosArray);
            localStorage.setItem(FAVORITES_KEY, favoritosString);
        }

        function toggleFavorito(pokemonId) {
            let favoritos = getFavoritos();
            const index = favoritos.indexOf(pokemonId);

            if (index > -1) {
                favoritos.splice(index, 1);
            } else {
                favoritos.push(pokemonId);
            }

            saveFavoritos(favoritos);

            //Se estiver no modo favoritos, re-renderiza para remover o Pokémon desfavoritado
            if (isShowingFavorites) {
                runSearch(); // Chama a busca que também aplica o filtro de favoritos
            } else {
                updateUI(); // Apenas atualiza o coração se não estiver no modo favoritos
            }
        }

        // Recupera o histórico de pesquisa do LocalStorage.
        function getRecentSearches() {
            const searchesString = localStorage.getItem(RECENT_SEARCHES_KEY);
            return searchesString ? JSON.parse(searchesString) : [];
        }

        // Salva um novo termo de pesquisa no histórico.
        function saveSearchTerm(term) {
            if (!term || term.length < 2) return; // Não salva termos muito curtos

            let searches = getRecentSearches();

            // Remove o termo se ele já existir (para colocá-lo no topo)
            searches = searches.filter(t => t.toLowerCase() !== term.toLowerCase());

            // Adiciona o novo termo no início
            searches.unshift(term);

            // Limita o array ao tamanho máximo
            searches = searches.slice(0, MAX_RECENT_SEARCHES);

            localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
            renderRecentSearches(); // Atualiza a exibição imediatamente
        }

        // Renderiza os termos de pesquisa recentes no HTML.
        function renderRecentSearches() {
            const searchesContainer = document.getElementById('recent-searches');
            if (!searchesContainer) return;

            const searches = getRecentSearches();
            searchesContainer.innerHTML = '';

            const containerPai = document.getElementById('recent-searches-container');
            if (searches.length === 0 && containerPai) {
                containerPai.style.display = 'none';
            }

            searches.forEach(term => {
                const item = document.createElement('div');
                item.className = 'recent-search-item';

                // Atribui o termo como atributo para ser usado na pesquisa
                item.setAttribute('data-search-term', term);

                // Faz o clique disparar a pesquisa (função runSearchFromHistory)
                item.onclick = runSearchFromHistory;

                item.textContent = term;

                searchesContainer.appendChild(item);
            });
        }

        function showRecentSearches() {
            // Cancela o timeout para que o menu não desapareça se o usuário focar novamente
            clearTimeout(hideTimeout);
            const container = document.getElementById('recent-searches-container');
            const searchesContainer = document.getElementById('recent-searches');
            // Só mostra se houver itens no histórico
            if (container && searchesContainer.children.length > 0) {
                container.style.display = 'flex';
            }
        }

        // Esconde o histórico de pesquisas com um atraso
        function hideRecentSearches() {
            const container = document.getElementById('recent-searches-container');
            if (container) {
                // Adiciona um pequeno atraso antes de esconder.
                hideTimeout = setTimeout(() => {
                    container.style.display = 'none';
                }, 200);
            }
        }
        // Função para executar a pesquisa quando um item do histórico é clicado.
        function runSearchFromHistory(event) {
            // Pega o termo de pesquisa do atributo do elemento clicado
            const term = event.currentTarget.getAttribute('data-search-term');
            const searchInput = document.getElementById('search-input');

            // Preenche o campo de busca com o termo
            searchInput.value = term;

            // Executa a busca
            runSearch();
            hideRecentSearches();
            searchInput.focus();
        }

        //Função para alternar o filtro de favoritos
        function toggleFavoriteFilter() {
            isShowingFavorites = !isShowingFavorites;
            // Toda a lógica de filtragem está em runSearch()
            runSearch();
        }

        //Função de Lógica Principal de Filtro (Não salva no histórico)
        function runSearch() {
            const searchInput = document.getElementById('search-input');
            const searchTerm = searchInput.value.toLowerCase().trim();

            let baseList = ALL_POKEMONS;

            //Aplica o filtro de favoritos (se ativo)
            if (isShowingFavorites) {
                const favoritos = getFavoritos();
                baseList = ALL_POKEMONS.filter(pokemon => favoritos.includes(pokemon.id));
            }

            //Aplica o filtro de pesquisa de texto
            let filteredPokemons;

            if (searchTerm === "") {
                // Se a busca estiver vazia, volta para a lista completa
                filteredPokemons = baseList;
            } else {
                // Lógica de filtro:
                filteredPokemons = baseList.filter(pokemon => {
                    const nameMatch = pokemon.nome.toLowerCase().includes(searchTerm);
                    const typeMatch = pokemon.tipos.some(tipo =>
                        tipo.toLowerCase().includes(searchTerm)
                    );
                    const idMatch = pokemon.id.toString().includes(searchTerm);

                    return nameMatch || typeMatch || idMatch;
                });
            }

            POKEMONS = filteredPokemons;
            renderPokemonGrid();
            updateUI();
        }


        // Manipula o clique no botão ou o pressionar de 'Enter'.
        // Esta função salva o termo no histórico E dispara a busca.

        function handleSearchSubmit() {
            const searchInput = document.getElementById('search-input');
            const searchTerm = searchInput.value.trim();

            // salva o termo no histórico (se não for vazio)
            if (searchTerm.length > 0) {
                saveSearchTerm(searchTerm);
            }

            // Executa a pesquisa (que já foi feita instantaneamente, mas é bom garantir)
            runSearch();
        }

        // Manipula a tecla 'Enter' no campo de pesquisa.

        function handleSearchKey(event) {
            // Se a tecla pressionada for 'Enter'
            if (event.key === 'Enter') {
                event.preventDefault();  // Impede o envio de formulário
                handleSearchSubmit();    // Chama a função que salva e busca
                return false;
            }
            // Permite que outras teclas sejam digitadas normalmente no campo
            return true;
        }

        function handleFavoriteToggle(pokemonId) {
            const id = parseInt(pokemonId);
            if (id > 0) {
                toggleFavorito(id);
            }
        }

        // Função chamada pelo clique do botão
        function selectGeneration(gen) {
            // 1. Atualiza o visual dos botões
            // Remove a classe 'active' de todos
            document.querySelectorAll('.gen-btn').forEach(btn => btn.classList.remove('active'));

            // Adiciona 'active' no botão clicado (usamos o texto para achar ou o indice)
            // Uma forma segura é pegar o botão que disparou o evento, mas aqui vamos pelo indice:
            const botoes = document.querySelectorAll('.gen-btn');
            if(botoes[gen-1]) {
                botoes[gen-1].classList.add('active');
            }

            // 2. Carrega os dados
            loadPokemonData(gen);
        }

        async function loadPokemonData(geracao = 1) {
            try {
                const grid = document.getElementById('pokemon-grid');
                // Loading bonito
                if(grid) grid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; color: white; padding: 50px;">
                        <p>Carregando Geração ${geracao}...</p>
                        <img src="background/fundo.gif" style="width: 50px; opacity: 0.5;">
                    </div>
                `;

                const response = await fetch(`/pokemons?gen=${geracao}`);

                if (!response.ok) throw new Error("Erro na API");

                const data = await response.json();

                ALL_POKEMONS = data;
                POKEMONS = data;

                renderPokemonGrid();
                updateUI(); // Reaplica os favoritos (corações)

            } catch (error) {
                console.error("Erro:", error);
            }
        }

        // Cria e injeta os cards de Pokémon na grade.
        function renderPokemonGrid() {
            const gridContainer = document.getElementById('pokemon-grid');
            if (!gridContainer) return;

            gridContainer.innerHTML = ''; // Limpa a grade antes de renderizar

            POKEMONS.forEach(pokemon => {
                const card = document.createElement('div');
                card.className = 'pokemon-card';

                // === Gui P.: Adicineio isto para os "pop-ups"  ===
                card.onclick = (event) => {
                    // Impede o clique se o alvo for o ícone de favorito
                    if (event.target.classList.contains('favorite-icon')) {
                        return;
                    }
                    openPokemonDetails(pokemon.id);
                };
                // =================================

                // Usamos o ID do JSON
                card.setAttribute('data-pokemon-id', pokemon.id);

                // Se o id for maior que 0, significa que é um Pokémon válido
                if (pokemon.id > 0) {

                    // O tipo é uma array, unimos com vírgula ou barra se houver mais de um.
                    const tiposHtml = pokemon.tipos.join(' / ');

                    // Card com Pokémon - Usando as novas chaves do JSON
                    card.innerHTML = `
                        <img src="${pokemon.imagem_url}" alt="${pokemon.nome}">
                        <h3>${pokemon.nome}</h3>
                        <p style="font-size: 0.8em; margin: 2px 0; color: #aaa;">#${pokemon.id}</p>
                        <p style="font-size: 0.7em; margin: 2px 0; font-weight: bold;">Tipo(s): ${tiposHtml}</p>
                        <span class="favorite-icon" onclick="handleFavoriteToggle(${pokemon.id})">
                            ♡
                        </span>
                    `;
                } else {
                    // Slot vazio (mantido para preencher a grade se necessário, embora não precise mais com um JSON completo)
                    card.innerHTML = `
                        <div style="height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; border: 1px dashed #444; border-radius: 8px;">
                            <h3 style="color: #444; font-size: 0.8em;">Slot Vazio</h3>
                        </div>
                    `;
                    card.querySelector('.favorite-icon').onclick = null;
                }

                gridContainer.appendChild(card);
            });
        }

        // Atualiza o ícone de favorito em todos os cards. (Mantida igual, apenas garante que funcione com os novos IDs)

        function updateUI() {
            const favoritos = getFavoritos();

            // Atualiza o ícone de favorito nos cards
            document.querySelectorAll('.pokemon-card').forEach(card => {
                const id = parseInt(card.getAttribute('data-pokemon-id'));
                const icon = card.querySelector('.favorite-icon');

                if (icon && id > 0) {
                    if (favoritos.includes(id)) {
                        icon.classList.add('favorited');
                        icon.textContent = '❤';
                    } else {
                        icon.classList.remove('favorited');
                        icon.textContent = '♡';
                    }
                }
            });

            // Atualiza a lista de IDs (para debug)
            const displayElement = document.getElementById('favoritos-list');
            if (displayElement) {
                displayElement.textContent = favoritos.length > 0 ? favoritos.join(', ') : 'Nenhum salvo.';
            }
        }

        // --- INICIALIZAÇÃO E CARREGAMENTO ---

        // Carrega os dados dos Pokémon do arquivo JSON externo.

        // Inicialização: carrega os dados e renderiza
        window.onload = () => {
            // Carrega os dados da API
            loadPokemonData();

            // funções de pesquisa aos elementos HTML
            const searchInput = document.getElementById('search-input');
            const searchBtn = document.getElementById('search-btn'); // Verifique se o ID do seu botão é 'search-btn'

            if (searchInput) {
                // Ao soltar uma tecla (para detectar o Enter)
                searchInput.addEventListener('keyup', handleSearchKey);
                // Ao clicar no campo (mostrar histórico)
                searchInput.addEventListener('focus', showRecentSearches);
                // Ao sair do campo (esconder histórico)
                searchInput.addEventListener('blur', hideRecentSearches);
            }

            if (searchBtn) {
                // Ao clicar no botão de lupa
                searchBtn.addEventListener('click', handleSearchSubmit);
            }

            // Renderiza o histórico que já estava salvo no LocalStorage
            renderRecentSearches();
            };

        function handleKeydown(event) {
            // Verifica se a tecla pressionada é 'Escape'
            if (event.key === 'Escape') {
                // Volta para a página inicial
                window.location.href = 'index.html';
            }
        }
        // Adiciona o Event Listener no objeto window
        window.addEventListener('keydown', handleKeydown);