import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
//a comment
//b comment

(() => {
  const NONE = 'none';
  const BLACK = 'black';
  const WHITE = 'white';
  const DIRECTIONS = [[1, 1], [1, 0], [1, -1], [0, 1], [0, -1], [-1, 1], [-1, 0], [-1, -1]];

  class Tile extends Component {

    render() {
      return (
        <button
          id={`tile-${this.props.x}-${this.props.y}`}
          className={`game-tile ${this.props.owner}`}
          onClick={this.props.onClick}
        >
        </button>
        );
      }
    }

    class WalkResults {
      constructor(canWalk, steps = []) {
        this.canWalk = canWalk;
        this.steps = steps;
      }
    }

    class Step {
      constructor(x, y) {
        this.x = x;
        this.y = y;
      }
    }

    class Board extends Component {

      constructor(props) {
        super(props);
        let initialBoardState = [[]];
        for (let y = 0; y < 8; y++) {
          initialBoardState[y] = [];
          for (let x = 0; x < 8; x++) {
            initialBoardState[y][x] = NONE;
          }
        }
        initialBoardState[4][4] = initialBoardState[3][3] = WHITE;
        initialBoardState[4][3] = initialBoardState[3][4] = BLACK;

        this.state = {
          boardState: initialBoardState,
          currentPlayer: BLACK,
          move: 0,
        };
      }

      resetBoardState() {
        let initialBoardState = [[]];
        for (let y = 0; y < 8; y++) {
          initialBoardState[y] = [];
          for (let x = 0; x < 8; x++) {
            initialBoardState[y][x] = NONE;
          }
        }
        initialBoardState[4][4] = initialBoardState[3][3] = WHITE;
        initialBoardState[4][3] = initialBoardState[3][4] = BLACK;

        this.setState({
          boardState: initialBoardState,
          currentPlayer: BLACK,
          move: 0,
        });
      }

      checkMove(player, x, y) {
        if (this.state.boardState[y][x] !== NONE) {
          return false;
        }
        for (let i = 0; i < DIRECTIONS.length; i++) {
          if (this.walkPath(player, x, y, DIRECTIONS[i][0], DIRECTIONS[i][1]).canWalk) {
            return true;
          }
        }
      }

      hasMove(player) {
        for (let y = 0; y < 8; y++) {
          for (let x = 0; x < 8; x++) {
            if (this.checkMove(player, x, y)) {
              return true;
            }
          }
        }
        return false;
      }

      walkPath(player, startX, startY, dirX, dirY) {
        let x = startX + dirX;
        let y = startY + dirY;
        let steps = [];
        //console.log(`Walking path as ${player}, starting at (${startX}, ${startY}) and following vector (${dirX}, ${dirY})`);
        if (x < 0 || y < 0 || x > 7 || y > 7 || this.state.boardState[y][x] === player) {
          //console.log(`${x} < 0 || ${y} < 0 || ${x} > 7 || ${y} > 7 || ${this.state.boardState[y][x]} === ${player}`);
          return new WalkResults(false);
        }
        for(; x >= 0 && y >= 0 && x < 8 && y < 8 && this.state.boardState[y][x] !== NONE; x += dirX, y += dirY) {
          if (this.state.boardState[y][x] === player) {
            //console.log('Found route...');
            //console.table(steps);
            return new WalkResults(true, steps);
          } else {
            steps.push(new Step(x, y));
          }
        }
        //console.log('Couldn\'t find route...');
        return new WalkResults(false);
      }

      getPiecesToFlip(startX, startY, dirX, dirY) {
        let results = this.walkPath(this.state.currentPlayer, startX, startY, dirX, dirY);
        if (!results.canWalk) {
          return [];
        }
        //console.log('Returning steps');
        return results.steps;
      }

      putPiece(x, y) {
        if (this.state.boardState[y][x] !== NONE) {
          return; //That piece is already placed.
        }
        let piecesToFlip = [];
        DIRECTIONS.forEach((direction) => piecesToFlip = piecesToFlip.concat(this.getPiecesToFlip(x, y, direction[0], direction[1])));
        if (piecesToFlip.length === 0) {
          return;
        }
        piecesToFlip.push(new Step(x, y));

        let newBoardState = this.state.boardState.slice();
        piecesToFlip.forEach(piece => newBoardState[piece.y][piece.x] = this.state.currentPlayer);

        let opponent = this.state.currentPlayer === BLACK ? WHITE : BLACK;
        let nextPlayer = this.state.currentPlayer;
        if (this.hasMove(opponent)) {
          nextPlayer = opponent;
        } else {
          console.log(`Skipping ${opponent}'s turn because they have no moves.`);
        }
        console.log(`${nextPlayer}'s turn`);

        this.setState({
          boardState: newBoardState,
          currentPlayer: nextPlayer,
          move: this.state.move + 1,
        });
      }

      score() {
        let black = 0;
        let white = 0;
        this.state.boardState.forEach((row) => {
          row.forEach((state) => {
            if (state === BLACK) {
              black++;
            }
            if (state === WHITE) {
              white++;
            }
          });
        });
        return {black: black, white: white};
      }

      renderTile(x, y, owner) {
        return (<Tile x={x} y={y} owner={owner}
          onClick={e => this.putPiece(x, y)}
          key={`${x}-${y}`}
                />);
      }

      render() {
        return (
          <div id='othello-board'>
            {(() => {
              let tiles = [];
              for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 8; x++) {
                  tiles.push(this.renderTile(x, y, this.state.boardState[y][x]));
                }
              }
              return tiles;
            })()}
          </div>
        );
      }
    }

    class OthelloGame extends Component {
      render() {
        return (
          <div className="game">
            <Board />
          </div>
      );
    }
  }

  ReactDOM.render(
    <OthelloGame />,
    document.getElementById('root')
  );
})();
