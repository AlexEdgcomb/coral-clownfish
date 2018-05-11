import RandomSuggester from './suggesters/random';
import BruteForceSuggester from './suggesters/bruce-force';

// Reference your suggester class here using an import statment like above.

// Add a new instance of your suggester here. It will then show up in game.
export default [
    new BruteForceSuggester('Brute force'),
    new RandomSuggester('Scott\'s randomizer'),
];
