"use strict";
document.addEventListener("DOMContentLoaded", () => {

    let memento = [];

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
    function CurrentMatrix() {
        return memento[memento.length - 1];
    }

    /**
     * Initialize a matrix and reset the memento
     * @param size
     */
    function initMatrix(size = GRID_SIZE) {
        let matrix = new Array(size);

        for (let i = 0; i < matrix.length; ++i) {
            matrix[i] = new Array(size).fill(false);
        }

        memento = [matrix];

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

        CurrentMatrix()[rowIndex][cellIndex] = true;

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

        if (cellY >= GRID_SIZE || cellX >= GRID_SIZE || CurrentMatrix()[cellY][cellX]) {
            return;
        }


        cx.fillStyle = "#a0a0a0";
        cx.fillRect(cvsX, cvsY, CANVAS_SIZE / GRID_SIZE, CANVAS_SIZE / GRID_SIZE);
    }

    /**
     * Update the display in the canvas
     */
    function updateDisplay() {
        let matrix = CurrentMatrix();

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
     * @param x
     * @param y
     * @returns {number}
     */
    function countNeighbors(x, y) {
        let res = 0;
        let matrix = CurrentMatrix();
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
     * @returns {boolean}
     */
    function next() {
        let newMatrix = [];
        let matrix = CurrentMatrix();
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

        if (matrixEquals(CurrentMatrix(), newMatrix)) {
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


    //******************************************
    //                  SCRIPT
    //******************************************

    const GRID_SIZE = 30;
    const CANVAS_SIZE = 600;

    initMatrix(GRID_SIZE);

    /*** @type {HTMLCanvasElement} */
    let canvas = document.getElementsByTagName('canvas')[0];
    let cx = canvas.getContext('2d');

    canvas.onmouseleave = () => updateDisplay();
    canvas.onmousemove = (e) => drawHoverRect(e);
    canvas.onclick = (e) => addPoint(e);

    let runningInterval = null;

    document.getElementById('btnNext').onclick = () => {
        if (runningInterval) {
            return;
        }
        next()
    }

    document.getElementById('btnPlay').onclick = () => {
        if (runningInterval) {
            return;
        }
        runningInterval = setInterval(() => {
            if (next() === false) {
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
        if (runningInterval) {
            return;
        }
        previous();
    }

});

