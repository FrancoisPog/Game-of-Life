"use strict";
document.addEventListener("DOMContentLoaded", () => {

    // TODO : Change the previous button to reset button
    
    const GRID_SIZE = 30;
    const CANVAS_SIZE = 600;
    const interval = 300;

    let memento = [];

    const canvas = document.getElementById('cvs');
    const cx = canvas.getContext('2d');

    initGame(GRID_SIZE);

    // Canvas listener
    canvas.onmouseleave = updateDisplay;
    canvas.onmousemove = drawHoverRect;
    canvas.onclick = addPoint;

    let runningInterval = null;

    // Buttons listener
    // TODO : disabled
    document.getElementById('btnNext').onclick = () => {
        runningInterval || next()
    }

    document.getElementById('btnPlay').onclick = () => {
        if (runningInterval) return;

        runningInterval = setInterval(() => {
            if (!next()) {
                clearInterval(runningInterval);
                runningInterval = null;
            }
        }, interval);
    }

    document.getElementById('btnStop').onclick = () => {
        clearInterval(runningInterval);
        runningInterval = null;
    }

    document.getElementById('btnReset').onclick = () => {
        runningInterval || previous();
    }

    document.getElementById('btnClear').onclick = () => {
        runningInterval || initGame();

    }



    //*********************************************
    //                  FUNCTIONS
    //*********************************************


    /**
     * Test if two matrix are equals
     * @param {Array[]} mat1
     * @param {Array[]} mat2
     * @returns {boolean}
     */
    function matrixEquals(mat1, mat2) {
        for (let i in mat1) {
            for (let j in mat1[i]) {
                if (mat1[i][j] !== mat2[i][j]) {
                    return false
                }
            }
        }

        return true;
    }

    /**
     * Get the current matrix
     * @returns {Array[]}
     */
    function currentMatrix() {
        return memento[memento.length - 1];
    }

    /**
     * Initialize a matrix and reset the memento
     * @param size
     */
    function initGame(size = GRID_SIZE) {
        let matrix = new Array(size);

        for (let i = 0; i < matrix.length; ++i) {
            matrix[i] = new Array(size).fill(false);
        }

        memento = [matrix];
        updateDisplay();

    }


    /**
     * Add a point in the matrix
     * @param e The mouse click event
     */
    function addPoint(e) {
        if (runningInterval != null) {
            return;
        }
        let rect = e.target.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;


        let rowIndex = Math.floor(y / (CANVAS_SIZE / GRID_SIZE));
        let cellIndex = Math.floor(x / (CANVAS_SIZE / GRID_SIZE));

        currentMatrix()[rowIndex][cellIndex] = true;

        updateDisplay();
    }


    /**
     * Fill the hovered cell by grey
     * @param e The mouse over event
     */
    function drawHoverRect(e) {
        if (runningInterval != null) {
            return;
        }
        updateDisplay();

        let rect = e.target.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        let cvsX = x - (x % (CANVAS_SIZE / GRID_SIZE));
        let cvsY = y - (y % (CANVAS_SIZE / GRID_SIZE));

        let cellX = cvsX / (CANVAS_SIZE / GRID_SIZE);
        let cellY = cvsY / (CANVAS_SIZE / GRID_SIZE)

        if (cellY >= GRID_SIZE || cellX >= GRID_SIZE || currentMatrix()[cellY][cellX]) {
            return;
        }


        cx.fillStyle = "#a0a0a0";
        cx.fillRect(cvsX, cvsY, CANVAS_SIZE / GRID_SIZE, CANVAS_SIZE / GRID_SIZE);
    }

    /**
     * Update the display in the canvas
     */
    function updateDisplay() {
        let matrix = currentMatrix();

        cx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        matrix.forEach((row, i) =>
            row.forEach((cell, j) => {
                if (cell) {
                    cx.fillStyle = "black";
                    cx.fillRect(
                        j * (CANVAS_SIZE / GRID_SIZE),
                        i * (CANVAS_SIZE / GRID_SIZE),
                        CANVAS_SIZE / GRID_SIZE,
                        CANVAS_SIZE / GRID_SIZE
                    );
                }
            })
        );
    }

    /**
     * Count the number of living cell in the neighbors
     * @param {number} x
     * @param {number} y
     * @returns {number}
     */
    function countNeighbors(x, y) {
        let res = 0;
        let matrix = currentMatrix();
        for (let i = x - 1; i <= x + 1; ++i) {
            for (let j = y - 1; j <= y + 1; ++j) {
                if (i >= 0 &&
                    j >= 0 &&
                    i < matrix.length &&
                    j < matrix.length &&
                    matrix[i][j] &&
                    !(j === y && i === x)
                ) {
                    res++;
                }
            }
        }
        return res;
    }

    /**
     * Move on the next generation
     * @returns {boolean} True if the next generation is different of the current, false otherwise
     */
    function next() {
        let newMatrix = [];
        let matrix = currentMatrix();

        for (let i = 0; i < matrix.length; ++i) {
            newMatrix[i] = [];
            for (let j = 0; j < matrix.length; ++j) {
                let nbNeighbors = countNeighbors(i, j);
                if (matrix[i][j]) {
                    newMatrix[i][j] = nbNeighbors === 2 || nbNeighbors === 3;
                } else {
                    newMatrix[i][j] = nbNeighbors === 3;
                }
            }
        }

        if (matrixEquals(currentMatrix(), newMatrix)) {
            return false;
        }

        memento.push(newMatrix);
        updateDisplay();

        return true;
    }

    /**
     * Back to the previous generation
     */
    function previous() {
        if (memento.length === 1) {
            return;
        }
        memento.pop();
        updateDisplay();
    }


});

