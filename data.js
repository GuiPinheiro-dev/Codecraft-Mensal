class Pokemon {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.imageUrl = data.imageUrl || 'caminho/para/imagem/padrao.png';
        this.type = data.type;
        this.weakness = data.weakness;
        this.resistances = data.resistances;
        this.baseHp = data.baseHp;
        this.baseAttack = data.baseAttack;
        this.baseDefense = data.baseDefense;
        this.baseSpecialAttack = data.baseSpecialAttack;
        this.baseSpecialDefense = data.baseSpecialDefense;
        this.baseSpeed = data.baseSpeed;
        this.abilities = data.abilities;
        this.individualValues = data.individualValues || 'Padrão';
        this.nature = data.nature || 'Padrão';
    }
}

// Seu array de dados original
const pokemonData = [
    {
        id: 1,
        name: 'Bulbasaur',
        imageUrl: 'caminho/para/imagem/bulbasaur.png',
        type: 'Grama, Veneno',
        weakness: 'Fogo, Psíquico, Voador, Gelo',
        resistances: 'Lutador, Água, Grama, Fada',
        baseHp: 45,
        baseAttack: 49,
        baseDefense: 49,
        baseSpecialAttack: 65,
        baseSpecialDefense: 65,
        baseSpeed: 45,
        abilities: 'Overgrow',
    },
    {
        id: 2,
        name: 'Charmander',
        imageUrl: 'caminho/para/imagem/charmander.png',
        type: 'Fogo',
        weakness: 'Água, Terra, Pedra',
        resistances: 'Fogo, Grama, Gelo, Inseto, Aço, Fada',
        baseHp: 39,
        baseAttack: 52,
        baseDefense: 43,
        baseSpecialAttack: 60,
        baseSpecialDefense: 50,
        baseSpeed: 65,
        abilities: 'Blaze',
    },
];

const pikachu = new Pokemon({
    id: 25,
    name: 'Pikachu',
    imageUrl: 'caminho/para/imagem/pikachu.png',
    type: 'Elétrico',
    weakness: 'Terra',
    resistances: 'Elétrico, Voador, Aço',
    baseHp: 35,
    baseAttack: 55,
    baseDefense: 40,
    baseSpecialAttack: 50,
    baseSpecialDefense: 50,
    baseSpeed: 90,
    abilities: 'Static'
});


// Cria um novo array, 'pokedex', onde cada item é uma instância da classe Pokemon
const pokedex = pokemonData.map(data => new Pokemon(data));
pokedex.push(pikachu);

// Lista só o Pikachu
console.log(pikachu);
// Lista um de cada vez
console.log(pokedex[0]);
console.log(pokedex[1]);
console.log(pokedex[2]);

// Criar uma map. para mostrar só os nomes e ids
const nomeId = pokedex.map(pokemon => {
    return{
    Id: pokemon.id,
    Nome: pokemon.name
    }
});
console.log(nomeId);

// Seleciona os elementos do HTML
const pikachuOutput = document.getElementById('pikachu-output');
const pokedexOutput = document.getElementById('pokedex-output');
const nomeIdOutput = document.getElementById('nome-id-output');

// Insere os dados formatados nos elementos HTML
pikachuOutput.innerText = JSON.stringify(pikachu, null, 2);
pokedexOutput.innerText = JSON.stringify(pokedex, null, 2);
nomeIdOutput.innerText = JSON.stringify(nomeId, null, 2);

console.log("Guilherme Pinheiro");
console.log("Kamilly da Rosa");
console.log("Mohammed Ahmed ");
console.log("Guilherme Gocks");
