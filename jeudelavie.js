"use strict";
document.addEventListener("DOMContentLoaded", () => {
    const GRID_SIZE = 20;
    const CANVAS_SIZE = 600;


    /**
     * Test if two matrix are equals
     * @param {Array[]} mat1
     * @param {Array[]} mat2
     * @returns {boolean}
     */
    function matrixEquals(mat1,mat2){
        for(let i in mat1){
            for(let j in mat1[i] ){
                if(mat1[i][j] !== mat2[i][j]){
                    return false
                }
            }
        }

        return true;
    }

    class Game {
        constructor() {
            this.state = {
                memento: [],
                bornCellColor: "green",
                deadCellColor: "red"
            }
            let matrix = new Array(GRID_SIZE);

            for (let i = 0; i < matrix.length; ++i) {
                matrix[i] = new Array(GRID_SIZE).fill(false);
            }

            this.state.memento.push(matrix);


            // TODO : take the canvas out of the class
            this.canvas = document.getElementById("cvs");
            this.cx = this.canvas.getContext("2d");

            this.canvas.onmouseleave = () => this.updateDisplay();
            this.canvas.onmousemove = (e) => this.drawHoverRect(e);
            this.canvas.onclick = (e) => this.addPoint(e);

        }

        get matrix() {
            return this.state.memento[this.state.memento.length - 1];
        }



        addPoint(e, canvas) {
            if(runningInterval != null){
                return;
            }
            let rect = e.target.getBoundingClientRect();
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;


            let rowIndex = Math.floor(y / (CANVAS_SIZE / GRID_SIZE));
            let cellIndex = Math.floor(x / (CANVAS_SIZE / GRID_SIZE));

            this.matrix[rowIndex][cellIndex] = true;

            this.updateDisplay();
        }


        drawHoverRect(e, canvas) {
            if(runningInterval != null){
                return;
            }

            this.updateDisplay();
            let rect = e.target.getBoundingClientRect();
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;

            let cellX = x - (x % (CANVAS_SIZE / GRID_SIZE));
            let cellY = y - (y % (CANVAS_SIZE / GRID_SIZE));

            // TODO : check if the x & y are in the matrix
            if (this.matrix[cellY / (CANVAS_SIZE / GRID_SIZE)][cellX / (CANVAS_SIZE / GRID_SIZE)]) {
                return;
            }

            this.cx.fillStyle = "#a0a0a0";
            this.cx.fillRect(cellX, cellY, CANVAS_SIZE / GRID_SIZE, CANVAS_SIZE / GRID_SIZE);
        }

        updateDisplay(canvas) {

            this.cx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
            this.matrix.forEach((row, i) =>
                row.forEach((cell, j) => {
                    if (cell) {
                        this.cx.fillStyle = "black";
                        this.cx.fillRect(
                            j * (CANVAS_SIZE / GRID_SIZE),
                            i * (CANVAS_SIZE / GRID_SIZE),
                            CANVAS_SIZE / GRID_SIZE,
                            CANVAS_SIZE / GRID_SIZE
                        );
                    }
                })
            );
        }

        countNeighbors(x, y) {
            let res = 0;
            for (let i = x - 1; i <= x + 1; ++i) {
                for (let j = y - 1; j <= y + 1; ++j) {
                    if (i >= 0 &&
                        j >= 0 &&
                        i < this.matrix.length &&
                        j < this.matrix.length &&
                        this.matrix[i][j] &&
                        !(j === y && i === x)
                    ) {
                        res++;
                    }
                }
            }
            return res;
        }

        next() {
            console.log('update');
            let newMatrix = [];
            for (let i = 0; i < this.matrix.length; ++i) {
                newMatrix[i] = [];
                for (let j = 0; j < this.matrix.length; ++j) {
                    let nbNeighbors = this.countNeighbors(i, j);
                    if (this.matrix[i][j]) {
                        newMatrix[i][j] = nbNeighbors === 2 || nbNeighbors === 3;
                    } else {
                        newMatrix[i][j] = nbNeighbors === 3;
                    }
                }
            }

            if(matrixEquals(this.matrix,newMatrix)){
                console.log('stable');
                return false;
            }

            this.state.memento.push(newMatrix);
            this.updateDisplay();
            return true;
        }

        previous(){
            if(this.state.memento.length === 1){
                return;
            }
            this.state.memento.pop();
            this.updateDisplay();
        }


    }

    let game = new Game();
    let runningInterval = null;

    document.getElementById('btnNext').onclick = () => {
        if(runningInterval){
            return;
        }
        game.next()
    }
    document.getElementById('btnPlay').onclick = () => {
        if (runningInterval) {
            return;
        }
        runningInterval = setInterval(() => {
            if(game.next() === false){
                clearInterval(runningInterval);
                runningInterval = null;
            }
        }, 300);
    }

    document.getElementById('btnStop').onclick = () => {
        clearInterval(runningInterval);
        runningInterval = null;
    }

    document.getElementById('btnReset').onclick = () => {
        if(runningInterval){
            return;
        }
        game.previous();
    }

})
;
