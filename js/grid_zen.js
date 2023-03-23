function Grid(size, previousState) {
    this.size = size;
    this.cells = previousState ? this.fromState(previousState) : this.empty();
    this.highestTileLogValue = 0;
  }
  
  // Build a grid of the specified size
  Grid.prototype.empty = function () {
    var cells = [];
  
    for (var x = 0; x < this.size; x++) {
      var row = cells[x] = [];
  
      for (var y = 0; y < this.size; y++) {
        row.push(null);
      }
    }
  
    return cells;
  };
  
  Grid.prototype.fromState = function (state) {
    var cells = [];
  
    for (var x = 0; x < this.size; x++) {
      var row = cells[x] = [];
  
      for (var y = 0; y < this.size; y++) {
        var tile = state[x][y];
        row.push(tile ? new Tile(tile.position, tile.logValue) : null);
      }
    }
  
    return cells;
  };
  
  // Find the first available random position
  Grid.prototype.randomAvailableCell = function () {
    var cells = this.availableCells();
  
    if (cells.length) {
      return cells[Math.floor(Math.random() * cells.length)];
    }
  };
  
  Grid.prototype.availableCells = function () {
    var cells = [];
  
    this.eachCell(function (x, y, tile) {
      if (!tile) {
        cells.push({ x: x, y: y });
      }
    });
  
    return cells;
  };
  
  // Call callback for every cell
  Grid.prototype.eachCell = function (callback) {
    for (var x = 0; x < this.size; x++) {
      for (var y = 0; y < this.size; y++) {
        callback(x, y, this.cells[x][y]);
      }
    }
  };
  
  // Check if there are any cells available
  Grid.prototype.cellsAvailable = function () {
    return !!this.availableCells().length;
  };
  
  // Check if the specified cell is taken
  Grid.prototype.cellAvailable = function (cell) {
    return !this.cellOccupied(cell);
  };
  
  Grid.prototype.cellOccupied = function (cell) {
    return !!this.cellContent(cell);
  };
  
  Grid.prototype.cellContent = function (cell) {
    if (this.withinBounds(cell)) {
      return this.cells[cell.x][cell.y];
    } else {
      return null;
    }
  };
  
  // Inserts a tile at its position
  Grid.prototype.insertTile = function (tile) {
    this.cells[tile.x][tile.y] = tile;
  };
  
  Grid.prototype.removeTile = function (tile) {
    this.cells[tile.x][tile.y] = null;
  };
  
  Grid.prototype.withinBounds = function (position) {
    return position.x >= 0 && position.x < 4 &&
           position.y >= 0 && position.y < 4;
  };
  
  
  
  Grid.prototype.lowestTileLogValue = function () {
    var lowestVal = -1;
    for (var x = 0; x < 4; x++) {
      for (var y = 0; y < 4; y++) {
        if (!!this.cells[x][y]) {
          if (this.cells[x][y].logValue < lowestVal || lowestVal < 0) {
            lowestVal = this.cells[x][y].logValue;
          }
        }
      }
    }
    return lowestVal;
  }
  
  Grid.prototype.evenNumLowValues = function () {
    var lowestVal = this.lowestTileLogValue();
    var num = 0;
    for (var x = 0; x < 4; x++) {
      for (var y = 0; y < 4; y++) {
        if (!!this.cells[x][y]) {
          if (this.cells[x][y].logValue === lowestVal) {
            num++;
          }
        }
      }
    }
    return num % 2 === 0;
  }

  Grid.prototype.getHighestTileLogValue = function () {
      return this.highestTileLogValue;
  }
  
  Grid.prototype.getGeneratedTileValue = function () {
      var highLogValue = this.getHighestTileLogValue();
  
      var tileLogValue = Math.ceil(highLogValue / 2);
      
      if (highLogValue - tileLogValue > gameDifficulty) {
          tileLogValue = highLogValue - gameDifficulty;
      }
      
      return tileLogValue;
  }
  
  Grid.prototype.getScore = function () {
    var vals = new Array();
    
    for (var x = 0; x < this.size; x++) {
      for (var y = 0; y < this.size; y++) {
        if (!!this.cells[x][y]) {
          vals.push(this.cells[x][y].logValue);
        }
      }
    }
    
    vals.sort(function(a, b){return b-a});
    
    this.highestTileLogValue = vals[0];
  
    /*var lowTile = Math.ceil(this.highestTileLogValue / 2);
  
    if (this.highestTileLogValue - lowTile > gameDifficulty) {
      lowTile = this.highestTileLogValue - gameDifficulty;
    }*/
    var lowTile = this.getGeneratedTileValue();
    
    var way2 = 0;
    var a,b,c;
    for (var i = 1; i < vals.length && vals[i] > lowTile; i++) {
        a = (vals[i] - lowTile) / (vals[i - 1] - lowTile);
        b = Math.pow(10, i);
        c = 9 / b;
        way2 += Math.pow(a, 2) * c;
    }
    
      way2 += vals[0] - 1;
  
      return way2;
  }
  
  Grid.prototype.serialize = function () {
    var cellState = [];
  
    for (var x = 0; x < this.size; x++) {
      var row = cellState[x] = [];
  
      for (var y = 0; y < this.size; y++) {
        row.push(this.cells[x][y] ? this.cells[x][y].serialize() : null);
      }
    }
  
    return {
      size: this.size,
      cells: cellState
    };
  };
  
  
  Grid.prototype.clone = function() {
    newGrid = new Grid(this.size);
    newGrid.playerTurn = this.playerTurn;
    for (var x = 0; x < this.size; x++) {
      for (var y = 0; y < this.size; y++) {
        if (this.cells[x][y]) {
          newGrid.insertTile(this.cells[x][y].clone());
        }
      }
    }
    return newGrid;
  };