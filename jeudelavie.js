"use strict";
document.addEventListener("DOMContentLoaded", () => {
    const GRID_SIZE = 5;
    const CANVAS_SIZE = 600;

    class Game {
        constructor() {
            this.matrix = new Array(GRID_SIZE);

            for (let i = 0; i < this.matrix.length; ++i) {
                this.matrix[i] = new Array(GRID_SIZE).fill(false);
            }



            this.canvas = document.getElementById("cvs");
            this.cx = this.canvas.getContext("2d");

            this.canvas.onmouseleave = () => this.updateDisplay();

            this.canvas.onmousemove = (e) => this.drawHoverRect(e);

            this.canvas.onclick = (e) => this.addPoint(e);
        }

        addPoint(e) {
            let rect = e.target.getBoundingClientRect();
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;


            let rowIndex = Math.floor(y / (CANVAS_SIZE / GRID_SIZE));
            let cellIndex = Math.floor(x / (CANVAS_SIZE / GRID_SIZE));

            this.matrix[rowIndex][cellIndex] = true;

            this.updateDisplay();
        }


        drawHoverRect(e) {
            this.updateDisplay();
            let rect = e.target.getBoundingClientRect();
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;

            let cellX = x - (x % (CANVAS_SIZE / GRID_SIZE));
            let cellY = y - (y % (CANVAS_SIZE / GRID_SIZE));

            console.log(cellY, cellX);
            if (this.matrix[cellY / (CANVAS_SIZE / GRID_SIZE)][cellX / (CANVAS_SIZE / GRID_SIZE)]) {
                return;
            }

            this.cx.fillStyle = "#a0a0a0";
            this.cx.fillRect(cellX, cellY, CANVAS_SIZE / GRID_SIZE, CANVAS_SIZE / GRID_SIZE);
        }

        updateDisplay() {
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
    }

    new Game();
});
