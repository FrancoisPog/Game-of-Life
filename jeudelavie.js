"use strict";
document.addEventListener("DOMContentLoaded", () => {


    // Constants
    const CANVAS_SIZE = 600;
    const NOT_ALIVE = 0;
    const ALIVE = 1;
    const NEW_BORN = 2;

    // Canvas
    const canvas = document.getElementById('cvs');
    const cx = canvas.getContext('2d');

    // Buttons
    const buttons = {}
    for (let type of ['Play', 'Next', 'Clear', 'Reset', 'Stop']) {
        buttons[type.toLowerCase()] = document.getElementById(`btn${type}`);
    }
    buttons.stop.setAttribute('disabled', '');

    // Speed
    const radSpeed = document.getElementsByName('radSpeed');

    // Size
    const select = document.getElementById('selResolution');


    // Color
    let colorNewInput = document.getElementById('colorNew');
    let colorNewCheckbox = document.getElementById('cbNew');
    let colorDyingInput = document.getElementById('colorDying');
    let colorDyingCheckbox = document.getElementById('cbDying');
    let colorBaseInput = document.getElementById('colorBase');


    // Game settings
    let gridSize = Number(select.children[select.selectedIndex].value);
    let speed = Number(document.querySelector('[name="radSpeed"]:checked').value);


    // Game
    let memento;
    let matrix;
    let runningInterval = null;


    initGame();

    // Canvas listener
    canvas.onmouseleave = updateDisplay;
    canvas.onmousemove = drawHoverRect;
    canvas.onclick = addPoint;


    // TODO: change speed during playing
    radSpeed.forEach(rad => rad.onchange = () => {
        speed = Number(document.querySelector('[name="radSpeed"]:checked').value);
        stop();
        play();
    })


    select.onchange = () => {
        if (!confirm('Are you sure ? ')) {
            return;
        }
        stop();
        gridSize = Number(select.children[select.selectedIndex].value);
        initGame();
    }


    // Buttons listener
    buttons.next.onclick = () => {
        runningInterval || next()
    }

    buttons.play.onclick = () => {
        runningInterval || play();
    }

    buttons.stop.onclick = stop;

    buttons.reset.onclick = () => {
        runningInterval || reset();
    }

    buttons.clear.onclick = () => {
        runningInterval || initGame();

    }


    //*********************************************
    //                  FUNCTIONS
    //*********************************************

    function play() {
        runningInterval = setInterval(() => {
            if (!next()) {
                clearInterval(runningInterval);
                runningInterval = null;
                updateButtons();
            }
        }, speed);

        updateButtons();
    }

    function stop() {
        clearInterval(runningInterval);
        runningInterval = null;
        updateButtons();
    }

    /**
     * Update the buttons 'disable' argument
     */
    function updateButtons() {
        for (let element of Object.values(buttons)) {
            if(element === buttons.stop ^ runningInterval !== null){
                element.setAttribute('disabled','');
            }else{
                element.removeAttribute('disabled');
            }
        }
    }

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
     * Initialize a matrix and reset the memento
     */
    function initGame() {
        matrix = new Array(gridSize);

        for (let i = 0; i < matrix.length; ++i) {
            matrix[i] = new Array(gridSize).fill(NOT_ALIVE);
        }

        memento = matrix;
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


        let rowIndex = Math.floor(y / (CANVAS_SIZE / gridSize));
        let cellIndex = Math.floor(x / (CANVAS_SIZE / gridSize));

        matrix[rowIndex][cellIndex] = ALIVE


        memento = matrix;

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

        let cvsX = x - (x % (CANVAS_SIZE / gridSize));
        let cvsY = y - (y % (CANVAS_SIZE / gridSize));

        let cellX = cvsX / (CANVAS_SIZE / gridSize);
        let cellY = cvsY / (CANVAS_SIZE / gridSize)

        if (cellY >= gridSize || cellX >= gridSize || matrix[cellY][cellX]) {
            return;
        }


        cx.fillStyle = "#a0a0a0";
        cx.fillRect(cvsX, cvsY, CANVAS_SIZE / gridSize, CANVAS_SIZE / gridSize);
    }

    /**
     * Update the display in the canvas
     */
    function updateDisplay() {


        cx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        matrix.forEach((row, i) =>
            row.forEach((cell, j) => {
                // TODO : set color from input
                if (cell) {
                    let color;
                    if (cell === NEW_BORN && colorNewCheckbox.checked) {
                        color = colorNewInput.value;
                    } else if (!willBeAlive(i, j) && colorDyingCheckbox.checked) {
                        color = colorDyingInput.value;
                    } else {
                        color = colorBaseInput.value;
                    }
                    cx.fillStyle = color;
                    cx.fillRect(
                        j * (CANVAS_SIZE / gridSize),
                        i * (CANVAS_SIZE / gridSize),
                        CANVAS_SIZE / gridSize,
                        CANVAS_SIZE / gridSize
                    );
                }
            })
        );

    }

    /**
     * Count the number of living cell in the neighbors
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     */
    function willBeAlive(x, y) {
        let nbNeighbors = 0;

        for (let i = x - 1; i <= x + 1; ++i) {
            for (let j = y - 1; j <= y + 1; ++j) {
                if (i >= 0 &&
                    j >= 0 &&
                    i < matrix.length &&
                    j < matrix.length &&
                    matrix[i][j] &&
                    !(j === y && i === x)
                ) {
                    nbNeighbors++;
                }
            }
        }

        if (matrix[x][y]) {
            return nbNeighbors === 2 || nbNeighbors === 3;
        } else {
            return nbNeighbors === 3;
        }
    }

    /**
     * Move on the next generation
     * @returns {boolean} True if the next generation is different of the current, false otherwise
     */
    function next() {
        let newMatrix = [];

        for (let i = 0; i < matrix.length; ++i) {
            newMatrix[i] = [];
            for (let j = 0; j < matrix.length; ++j) {
                if (willBeAlive(i, j)) {
                    if (matrix[i][j]) {
                        newMatrix[i][j] = ALIVE;
                    } else {
                        newMatrix[i][j] = NEW_BORN;
                    }
                } else {
                    newMatrix[i][j] = NOT_ALIVE;
                }
            }
        }

        if (matrixEquals(matrix, newMatrix)) {
            return false;
        }

        matrix = newMatrix;

        updateDisplay();

        return true;
    }

    /**
     * Back to the initial generation
     */
    function reset() {
        matrix = memento;
        updateDisplay();
    }


});

