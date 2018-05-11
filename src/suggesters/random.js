import Suggester from './suggester';
import CellSuggestion from './cell-suggestion';

export default class RandomSuggester extends Suggester {

    /**
       Return a random number integer in a range.
       @method _getRandomInt
       @param {Integer} min The minimum in range.
       @param {Integer} max The max in range.
       @return {Integer}
    */
    _getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max) + 1;
        return Math.floor(Math.random() * (max - min)) + min;
    }

    /**
       Overridden method of base class. Will return a random cell to click.
       @method nextSuggestion
       @param {Game} Game object
       @return {Cell}
    */
    nextSuggestion(game) {

        const size = game.board.length - 1;
        let row, column  = 0;

        // Pick a non coral cell
        do {
            row = this._getRandomInt(1, size);
            column = this._getRandomInt(1, size);
        } while (game.board[row][column].type === 'coral');

        return new CellSuggestion(row, column);
    }
}
