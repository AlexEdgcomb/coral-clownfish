import Suggester from './suggester';
import CellSuggestion from './cell-suggestion';

export default class BruteForceSuggester extends Suggester {

    /**
       Utility methode to determine whether or not all the fish have space.
       @method _fishHaveSpace
       @param {Board} Game board.
       @return {Boolean}
    */
    _fishHaveSpace(board)  {
        // Make sure an indidivual fish defined at rowIndex, columnIndex has space.
        // No fish can be around in its immediate vicinity.
        const hasSpace = function(rowIndex, columnIndex) {

            const cells = [];

            if (rowIndex >= 1 && columnIndex >= 1) {
                cells.push(board[ rowIndex - 1 ][ columnIndex - 1 ])
            }
            if (columnIndex >= 1) {
                cells.push(board[ rowIndex ][ columnIndex - 1 ])
            }
            if (rowIndex >= 1) {
                cells.push(board[ rowIndex - 1 ][ columnIndex ]);
            }
            if (rowIndex <= board.length -2 && columnIndex >= 1) {
                cells.push(board[ rowIndex + 1 ][ columnIndex - 1 ]);
            }
            if (rowIndex <= board.length -2) {
                cells.push(board[ rowIndex + 1 ][ columnIndex ]);
            }
            // Bottom left
            if (rowIndex >= 1 && columnIndex <= board.length - 2) {
                cells.push(board[ rowIndex - 1 ][ columnIndex + 1 ]);
            }
            // Bottom
            if (columnIndex <= board.length - 2) {
                cells.push(board[ rowIndex     ][ columnIndex + 1 ]);
            }
            // Bottom right
            if (rowIndex <= board.length -2 && columnIndex <= board.length -2) {
                cells.push(board[ rowIndex + 1 ][ columnIndex + 1 ]);
            }

            return !cells.some(cell => cell && cell.type === 'clownfish');
        }

        let fishHaveSpace = true;
        board.forEach((row, rowIndex) => {
            row.forEach((cell, columnIndex) => {
                if (cell.type === 'clownfish' && !hasSpace(rowIndex, columnIndex)) {
                    fishHaveSpace = false;
                }
            });
        });

        return fishHaveSpace;
    }

    /**
       Utility method to determine if the whole board has been filled in. Basically no more empty cells
       @method boardCompleted
       @param {Board} Game board.
       @return {Boolean}
    */
    _boardCompleted(board) {
        return !board.some(row => row.some(cell => cell.type === 'empty'));
    }

    /**
       Utility function to determin if all row and column constraints have been satisified.
       @method _rowColConstraintsFulfilled(board)
       @param {Board} Game board.
       @return {Boolean}
    */
    _rowColConstraintsFulfilled(board) {
        // Pull all row and column constraints. We'll use to determine if board is showing a winner.
        const cols = board[0];
        const rows = board.map(row => row[0]);

        return rows.every(cell => cell.fulfilled) && cols.every(cell => cell.fulfilled);
    }

    // Make sure an indidivual coral defined at rowIndex, columnIndex has a fish around it.
    hasFish(board, rowIndex, columnIndex) {

        const cells = [];

        // Top
        if (columnIndex >= 1) {
            cells.push(board[ rowIndex ][ columnIndex - 1 ])
        }
        // Left
        if (rowIndex >= 1) {
            cells.push(board[ rowIndex - 1 ][ columnIndex ]);
        }
        // Bottom
        if (rowIndex <= board.length - 2) {
            cells.push(board[ rowIndex + 1 ][ columnIndex ]);
        }
        // Right
        if (columnIndex <= board[0].length - 2) {
            cells.push(board[ rowIndex ][ columnIndex + 1 ]);
        }

        return cells.some(cell => cell.type === 'clownfish');
    }

    _coralHaveFishInAllButLastRow(board) {
      let coralHaveFish = true;

      for (let rowIndex = 1; rowIndex < (board.length - 1); rowIndex++) {
          board[rowIndex].forEach((cell, columnIndex) => {
              if (cell.type === 'coral' && !this.hasFish(board, rowIndex, columnIndex)) {
                  coralHaveFish = false;
              }
          });
      }

      return coralHaveFish;
    }

    /**
       Utility function if all coral have a clownfish to keep them healthy.
       @method _coralHaveFish
       @param {Board} Game board.
       @return {Boolean}
    */
    _coralHaveFish(board) {
        let coralHaveFish = true;
        board.forEach((row, rowIndex) => {
            row.forEach((cell, columnIndex) => {
                if (cell.type === 'coral' && !this.hasFish(board, rowIndex, columnIndex)) {
                    coralHaveFish = false;
                }
            });
        });

        return coralHaveFish;
    }

    /**
       Returns true if board is in a winning state. False otherwise.
       @method isWinner
       @param {Object} board The game board.
       @return {Boolean}
    */
    isWinner(board) {
        this.setFulfillment(board);
        return this._rowColConstraintsFulfilled(board) &&
            this._fishHaveSpace(board) &&
            this._coralHaveFish(board);
    }

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

    clone(board) {
        return JSON.parse(JSON.stringify(board));
    }

    setFulfillment(board) {
        // Update column constraints.
        const colConstraintCells = board[0];
        for (let i = 1; i < colConstraintCells.length; i++) {
            const colConstraintCell = colConstraintCells[i];
            const column = board.map(row => row[i]);
            const numClownfish = column.filter(cell => cell.type === 'clownfish').length;

            colConstraintCell.fulfilled = colConstraintCell.value === numClownfish;
            colConstraintCell.fulfillmentExceeded = colConstraintCell.value < numClownfish;
            colConstraintCell.unfulfilled = !colConstraintCell.fulfilled;
        }

        // Update row constraints.
        const rowConstraintCells = board.map(row => row[0]);
        for (let i = 1; i < rowConstraintCells.length; i++) {
            const rowConstraintCell = rowConstraintCells[i];
            const row = board[i];
            const numClownfish = row.filter(cell => cell.type === 'clownfish').length;

            rowConstraintCell.fulfilled = rowConstraintCell.value === numClownfish;
            rowConstraintCell.fulfillmentExceeded = rowConstraintCell.value < numClownfish;
            rowConstraintCell.unfulfilled = !rowConstraintCell.fulfilled;
        }
    }

    findValidRows(row, column, board, validRows) {
        column++;
        board = this.clone(board);

        // Row is full. Check if valid.
        if (column >= board[0].length) {

            // End early if fulfillment not met.
            this.setFulfillment(board);
            if (!board[row][0].fulfilled) {
                return;
            }

            // End early if fish not spaced well.
            const subBoard = board.filter((row, index) => index < row);
            if (!this._fishHaveSpace(subBoard)) {
                return;
            }

            validRows.push(board[row]);
        }
        else if (board[row][column].type === 'empty') {
            board[row][column].type = 'water';
            this.findValidRows(row, column, board, validRows);

            board[row][column].type = 'clownfish';
            this.findValidRows(row, column, board, validRows);
        }
        else {
            this.findValidRows(row, column, board, validRows);
        }
    }

    findValidRowsPerColumn(board) {
        const findValidRowsPerColumn = [];

        for (let i = 1; i < board.length; i++) {
            findValidRowsPerColumn[i - 1] = [];
            this.findValidRows(i, 0, board, findValidRowsPerColumn[i - 1]);
        }

        return findValidRowsPerColumn;
    }

    findWinningBoard(validRowsPerColumn, depth, current) {
        current = this.clone(current);

        if (depth >= validRowsPerColumn.length) {
            if (this.isWinner(current)) {
                return current;
            };
        }
        else {
            if (current.length > 2) {

                // End early if |current| exceeds fulfillment.
                this.setFulfillment(current);
                for (let i = 1; i < current[0].length; i++) {
                    if (current[0][i].fulfillmentExceeded) {
                        return;
                    }
                }

                // End early if fish not spaced well.
                if (!this._fishHaveSpace(current)) {
                    return;
                }

                // End early if corals in all but last row don't have a fish.
                if (!this._coralHaveFishInAllButLastRow(current)) {
                    debugger
                    return;
                }
            }

            for (let i = 0; i < validRowsPerColumn[depth].length; i++) {
                current.push(validRowsPerColumn[depth][i]);

                const winner = this.findWinningBoard(validRowsPerColumn, depth + 1, current);

                current.pop();

                if (winner) {
                    return winner;
                }
            }
        }
    }

    clearBoard(board) {
        board.forEach(row => {
            row.forEach(column => {
                if (column.type === 'water' || column.type === 'clownfish') {
                    column.type = 'empty';
                }
            });
        });
    }

    /**
       Overridden method of base class. Will return a random cell to click.
       @method nextSuggestion
       @param {Game} Game object
       @return {Cell}
    */
    nextSuggestion(game) {
        const clonedBoard = this.clone(game.board);

        this.clearBoard(clonedBoard);

        const validRowsPerColumn = this.findValidRowsPerColumn(clonedBoard);
        const winningBoard = this.findWinningBoard(validRowsPerColumn, 0, [ clonedBoard[0] ]);

        for (let rowIndex = 1; rowIndex < clonedBoard.length; rowIndex++) {
            for (let columnIndex = 1; columnIndex < clonedBoard[0].length; columnIndex++) {
                if (game.board[rowIndex][columnIndex].type !== winningBoard[rowIndex][columnIndex].type) {
                    return new CellSuggestion(rowIndex, columnIndex)
                }
            }
        }
    }
}
