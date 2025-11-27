// Mapeamento de nomes de tipos para nomes de arquivos JPG
    const TYPE_TO_BACKGROUND = {
        "Grama": "Planta", "Terra": "Terrestre", "Fogo": "Fogo", "Água": "Água",
        "Elétrico": "Elétrico", "Fantasma": "Fantasma", "Venenoso": "Venenoso",
        "Dragão": "Dragão", "Voador": "Voador", "Normal": "Normal", "Inseto": "Inseto",
        "Fada": "Fada", "Gelo": "Gelo", "Psíquico": "Psíquico", "Pedra": "Pedra",
        "Aço": "Aço", "Lutador": "Lutador", "Sombrio": "Sombrio"
    };

    function getPokemonIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return parseInt(params.get('id')) || 0;
    }

    async function loadPokemonDetails() {
        const pokemonId = getPokemonIdFromUrl();
        if (pokemonId === 0) {
            document.getElementById('loading-error').textContent = "ID do Pokémon inválido.";
            document.getElementById('loading-error').style.display = 'block';
            return;
        }

        try {
                // Fetch dos dados do da Poke API
            const response = await fetch(`/pokemons/${pokemonId}`);

            if (!response.ok) {
                throw new Error("Falha ao carregar pokemons.json");
            }
            const pokemon = await response.json();

            if (!pokemon) {
                document.getElementById('loading-error').textContent = `Pokémon com ID #${pokemonId} não encontrado.`;
                document.getElementById('loading-error').style.display = 'block';
                return;
            }

            // APLICA O FUNDO DO TIPO DO POKÉMON NA CAMADA DE BLUR
            const primaryType = pokemon.tipos[0];
            const backgroundTypeName = TYPE_TO_BACKGROUND[primaryType] || primaryType;

            // USANDO .jpg
            const backgroundPath = `../Sprites-Fundo/${backgroundTypeName}.jpg`;

            console.log("67.png");

            // Aplica o Background à nova camada de desfoque
            const blurredLayer = document.getElementById('blurred-background-layer');
            blurredLayer.style.backgroundImage = `url(${backgroundPath})`;

            //APLICAÇÃO DOS DADOS NO NOVO LAYOUT
            document.getElementById('pokemon-details').style.display = 'grid';
            document.getElementById('pokemon-name-title').textContent = pokemon.nome.toUpperCase();

            document.getElementById('pokemon-image').src = pokemon.imagem_url;
            document.getElementById('pokemon-image').alt = pokemon.nome;

            document.getElementById('pokemon-id').textContent = pokemon.id;
            document.getElementById('pokemon-types').textContent = pokemon.tipos.join(' / ');
            document.getElementById('pokemon-height').textContent = pokemon.altura_m.toFixed(1).replace('.', ',');
            document.getElementById('pokemon-weight').textContent = pokemon.peso_kg.toFixed(1).replace('.', ',');

            // Injetar Estatísticas
            const statsGrid = document.getElementById('stats-grid');
            statsGrid.innerHTML = '';

            const statNames = {
                "hp": "VIDA",
                "ataque": "DANO",
                "defesa": "DEFESA",
                "ataque_especial": "ATQ. ESP.",
                "defesa_especial": "DEF. ESP.",
                "velocidade": "VELOCIDADE"
            };

            for (const key in pokemon.estatisticas_base) {
                const statValue = pokemon.estatisticas_base[key];
                const statName = statNames[key] || key;
                const statElement = document.createElement('div');
                statElement.className = 'stat-item';
                statElement.innerHTML = `<strong>${statName}:</strong> ${statValue}`;
                statsGrid.appendChild(statElement);
            }

            // Injetar Habilidades
            const abilitiesList = document.getElementById('pokemon-abilities');
            abilitiesList.innerHTML = '';

            pokemon.habilidades.forEach(habilidade => {
                const abilityItem = document.createElement('li');
                abilityItem.className = 'ability-item';
                let text = habilidade.nome;
                if (habilidade.escondida) {
                    text += ' (Hidden)';
                }
                abilityItem.textContent = text;
                abilitiesList.appendChild(abilityItem);
            });

            // 4. INJETAR A DESCRIÇÃO DO POKÉMON
            const notesElement = document.getElementById('pokemon-notes');
            notesElement.textContent = pokemon.descricao
                ? pokemon.descricao
                : "Nenhuma anotação ou descrição disponível para este Pokémon. Adicione o campo 'descricao' no seu JSON!";

        } catch (error) {
            console.error("Erro ao carregar detalhes do Pokémon:", error);
            document.getElementById('loading-error').textContent = "Erro ao carregar dados. Verifique a console para mais detalhes.";
            document.getElementById('loading-error').style.display = 'block';
            document.getElementById('pokemon-details').style.display = 'none';
        }
    }

    // --- FUNÇÃO PARA A TECLA ESC ---
    function handleKeydown(event) {
        // Verifica se a tecla pressionada é 'Escape'
        if (event.key === 'Escape') {
            // Executa a mesma ação do botão 'Voltar'
            window.location.href = '../Pokedex/pokedex.html';
        }
    }

    // Adiciona o Event Listener no objeto window
    window.addEventListener('keydown', handleKeydown);
    // --- FIM DA FUNÇÃO ---

    window.onload = loadPokemonDetails;