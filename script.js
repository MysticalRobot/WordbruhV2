"use strict";
class Wordbruh {
  constructor(target, notGuessed, over, previousGuesses) {
    this.target = target; // (string) word to be guessed
    this.targetMap = new Map(); // (map) target letter-[occurences]
    for (let i = 0; i < 6; i++) {
      const char = target.charAt(i);
      if (this.targetMap.has(char)) {
        this.targetMap.get(char).add(i);
      } else {
        this.targetMap.set(char, new Set([i]));
      }
    }
    this.notGuessed = notGuessed; // (array) indices of letters not guessed yet
    this.over = over; // (boolean)
    this.previousGuesses = previousGuesses; // (array) prev guesses
    this.currentGuess = [" ", " ", " ", " ", " ", " "]; // (array) current guesses
    this.tileIndex = 0; // (float) current tile index
    this.alertCount = 0;
    this.running = false; // (boolean)
    this.settingsOpen = false;
    this.howToOpen = false;
    this.accountOpen = false;
    this.light = true;
    this.highContrast = false;
  }

  checkAnswer() {
    let guess = "";
    for (let i = 0; i < 6; i++) {
      if (this.currentGuess[i] == " ") {
        showAlert("no spaces pls..");
        return;
      }
      guess += this.currentGuess[i];
    }
    // TODO check wordlist
    let i = this.previousGuesses.length;
    const limit = i + 6;
    for (; i < limit; i++) {
      const tile = guesses.children[i];
      const char = tile.innerHTML;
      const charIndex = i % 6;
      if (this.targetMap.has(char)) {
        if (this.targetMap.get(char).has(charIndex)) {
          tile.classList.add("fein");
          mappedCharButtons.get(char).classList.add("fein");
          this.notGuessed.splice(this.notGuessed.indexOf(charIndex), 1);
        } else {
          tile.classList.add("meh");
          mappedCharButtons.get(char).classList.add("meh");
        }
      } else {
        tile.classList.add("rip");
        mappedCharButtons.get(char).classList.add("rip");
      }
      this.previousGuesses.push(char);
    }
    // TODO add animation, alert
    const previousTile = guesses.children[this.previousGuesses.length - 1];
    previousTile.classList.remove("selected");
    if (guess == this.target) {
      // lost
      endGame();
    } else if (this.previousGuesses.length != 36) {
      const newTile = guesses.children[this.previousGuesses.length];
      newTile.classList.add("selected");
      this.currentGuess = [" ", " ", " ", " ", " ", " "];
      this.tileIndex = 0;
    } else {
      // lost
      endGame();
    }
  }

  // gradeTile(tile, )

  updateTile(newTileIndex, newChar) {
    if (newChar) {
      this.currentGuess[this.tileIndex] = newChar;
    }
    let index = this.previousGuesses.length + this.tileIndex;
    const tile = guesses.children[index];
    console.log(tile);
    tile.innerHTML = this.currentGuess[this.tileIndex];
    tile.classList.remove("selected");
    this.tileIndex = newTileIndex
    index = this.previousGuesses.length + this.tileIndex;
    const nextTile = guesses.children[index];
    nextTile.classList.add("selected");
  }
 
  updateCharButton(button) {
    button.classList.add("fein");
  }

  displayHint() {
    const notGuessed = new Set(this.notGuessed);
    for (let i = 0; i < 6; i++) {
      if (notGuessed.has(i)) {
        this.updateCharButton(mappedCharButtons.get(this.target.charAt(i)));
        this.notGuessed.splice(this.notGuessed.indexOf(i), 1);
        // TODO: alert, animation (same as entering letter)
        break;
      }
    }
    disableHintButton();
  }
}

// fein color
const feinGuessColor = "#5fa7ef";

// landing screen elements
const landingScreen = document.getElementById('landingScreen');
const landingLogInButton = document.getElementById('landingLogInButton');
const playButton = document.getElementById('playButton');
const continueButton = document.getElementById('continueButton');
const seeStatsButton = document.getElementById('seeStatsButton');

// pop up elements
const overlay = document.getElementById('overlay');
const settings = document.getElementById('settings');
const settingsExitButton = document.getElementById('settingsExitButton');

// big body
const body = document.getElementsByName("body");

// game screen elements
const gameScreen = document.getElementById('gameScreen');
const alertList = document.getElementById('alertList');
const settingsButton = document.getElementById('settingsButton');
const hintButton = document.getElementById('hintButton');
const howToButton = document.getElementById('howToButton');
const accountButton = document.getElementById('accountButton');
// game elements
const charButtons = document.querySelectorAll('[data-char]');
const mappedCharButtons = new Map(); // mainly for keyboard based on guesses
const onCooldown = new Set(); // tracks pressed buttons (prevents key spamming)
const enterButton = document.querySelector('[data-enter]');
const deleteButton = document.querySelector('[data-delete]');
const leftButton = document.querySelector('[data-left]');
const rightButton = document.querySelector('[data-right]');
const spaceButton = document.querySelector('[data-space]');
// makes it easy to check if a valid key was pressed
const otherButtons = new Set(["BACKSPACE", "ENTER", "ARROWLEFT", "ARROWRIGHT", " "]);
const guesses = document.querySelector('[data-guesses]'); // holds all game tiles
const game = new Wordbruh("SCARAB", [0, 1, 2, 3, 4, 5], false, []);

function loadGame() {
  // TODO
}

function showSettings() {
  console.log("open sesame");
  overlay.style.display = "flex"
  overlay.classList.add('overlayFadeIn');
  settings.classList.add('popUpFadeIn');
  setTimeout(() => {
   game.running = false;
   game.settingsOpen = true;
  }, 150);
}

function hideSettings() {
  console.log("close sesame");
  overlay.classList.replace('overlayFadeIn', 'overlayFadeOut');
  settings.classList.replace('popUpFadeIn', 'popUpFadeOut');
  setTimeout(() => {
   overlay.classList.remove('overlayFadeOut');
   settings.classList.remove("popUpFadeOut");
   overlay.style.display = "none"
   game.running = true;
   game.settingsOpen = false;
  }, 150);
}

function switchToGameScreen() {
  landingScreen.classList.add('fadingElement');
  setTimeout(() => {
   landingScreen.style.display = "none";
   landingScreen.classList.remove("fadingElement");
   gameScreen.style.display = "block";
   game.running = true;
  }, 200);
}

async function showAlert(text) {
  console.log(text);
  if (game.alertCount >= 9) {
    return;
  }
  const newAlert = document.createElement("li");
  const alertText = document.createTextNode(text);
  newAlert.appendChild(alertText);
  newAlert.classList.add("alert");
  const firstChild = alertList.firstChild;
  alertList.insertBefore(newAlert, firstChild);
  game.alertCount++;
  await new Promise((resolve) => {
    setTimeout(() => {
      alertList.removeChild(newAlert);
      game.alertCount--;
    }, 1650);
  });
}

function disableHintButton() {
  hintButton.ariaDisabled = "true";
  hintButton.classList.add("disabledHeaderButton");
}

function disableKeyboard() {
  charButtons.forEach(button => {
    button.ariaDisabled = "true";
  });
  enterButton.ariaDisabled = "true";
  deleteButton.ariaDisabled = "true";
  leftButton.ariaDisabled = "true";
  rightButton.ariaDisabled = "true";
  spaceButton.ariaDisabled = "true";
}

function endGame() {
  game.over = true;
  game.running = false;
  disableHintButton();
  disableKeyboard();
}

landingLogInButton.addEventListener('click', () => {
});

playButton.addEventListener('click', () => {
  switchToGameScreen();
});

continueButton.addEventListener('click', () => {
  switchToGameScreen();
});

seeStatsButton.addEventListener('click', () => {
  switchToGameScreen();
});

overlay.addEventListener('click', (event) => {
  if (game.settingsOpen && event.target == overlay) {
    hideSettings();
  }
});

settingsButton.addEventListener('click', () => {
  showSettings();
});

settingsExitButton.addEventListener('click', () => {
  hideSettings();
});

hintButton.addEventListener('click', () => {
    if (game.running && !game.over) {
      game.displayHint();
    }
}, { once: true });

howToButton.addEventListener('click', () => {
});

accountButton.addEventListener('click', () => {
});

window.addEventListener("load", () => {
  if (game.running && !game.over) {
    game.tileIndex = 0
    const index = game.previousGuesses.length;
    guesses.children[index].classList.add("selected");
  }
});

document.body.addEventListener('keydown', button => {
  const pressed = button.key.toUpperCase();
  console.log(pressed);
  if (game.running && !game.over && !onCooldown.has(pressed) &&
    (mappedCharButtons.has(pressed) || otherButtons.has(pressed))) { 
    onCooldown.add(pressed);
    switch (pressed) {
      case "ENTER":
        game.checkAnswer();
        break;
      case "BACKSPACE":
        game.updateTile(Math.max(game.tileIndex - 1, 0), " ");
        break;
      case "ARROWLEFT":
        game.updateTile(Math.max(game.tileIndex - 1, 0), "");
        break;
      case "ARROWRIGHT":
        game.updateTile(Math.min(game.tileIndex + 1, 5), "");
        break;
      default:
        game.updateTile(Math.min(game.tileIndex + 1, 5), pressed);
    }
  }
});

document.body.addEventListener('keyup', button => {
  const pressed = button.key.toUpperCase();
  if (game.running && !game.over && onCooldown.has(pressed)) {
      onCooldown.delete(pressed);
  }
});

charButtons.forEach(button => {
  mappedCharButtons.set(button.innerHTML, button);
  button.addEventListener('click', () => {
    if (game.running && !game.over) {
      game.updateTile(Math.min(game.tileIndex + 1, 5), button.innerHTML);
    }
  });
});

enterButton.addEventListener('click', () => {
  if (game.running && !game.over) {
    game.checkAnswer();
  }
});

deleteButton.addEventListener('click', () => {
  if (game.running && !game.over) {
    game.updateTile(Math.max(game.tileIndex - 1, 0), " ");
  }
});

leftButton.addEventListener('click', () => {
  if (game.running && !game.over) {
    game.updateTile(Math.max(game.tileIndex - 1, 0), "");
  }
});

rightButton.addEventListener('click', () => {
  if (game.running && !game.over) {
    game.updateTile(Math.min(game.tileIndex + 1, 5), "");
  }
});

spaceButton.addEventListener('click', () => {
  if (game.running && !game.over) {
    game.updateTile(Math.min(game.tileIndex + 1, 5), " ");
  }
});

/*
- document.createElement for popup messages
- form and storage web api
- ajax for the sign in and chart maybe
*/


