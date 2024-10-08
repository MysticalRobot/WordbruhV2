"use strict";
class Wordbruh {
  constructor(target, feinGuessed, over, hintRevealed, hardModeEnabled, previousGuesses) {
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
    this.feinGuessed = feinGuessed; // (array) indices of letters fein guessed
    this.over = over; // (boolean)
    this.hintRevealed = hintRevealed;
    this.hardModeEnabled = hardModeEnabled;
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
    this.onscreenKeyboardOnly = false;

    if (!this.over) {
      this.tileIndex = 0
      const index = this.previousGuesses.length;
      tiles[index].classList.add("selected");
    }

    if (!this.hardModeEnabled && this.previousGuesses.length != 0) {
      hardModeToggle.ariaDisabled = 'true';
    }
  }

  checkAnswer() {
    // check for spaces
    for (const char of this.currentGuess) {
      if (char == " ") {
        showAlert("no spaces pls..");
        return;
      }
    }

    // (hardmode only) check if all revealed hints are used
    const feinGuessedSet = new Set(this.feinGuessed);
    if (this.hardModeEnabled) {
      console.log("i am hard man");
      const positions = ['1st', '2nd', '3rd', '4th', '5th', '6th'];
      for (let i = 0; i < 6; i++) {
        if (this.target.charAt(i) != this.currentGuess[i] && feinGuessedSet.has(i)) {
          showAlert(`${positions[i]} letter must be ${this.target.charAt(i)}`);
          return;
        }
      }
    }
    
    // TODO check wordlist
    
    // update each tile
    let i = this.previousGuesses.length;
    let matches = 0;
    const limit = i + 6;
    for (; i < limit; i++) {
      // get the first tile of the current guess
      const tile = tiles[i];
      const charIndex = i % 6;
      const char = this.currentGuess[charIndex];
      const animationDelay = charIndex * 100;
      if (this.targetMap.has(char)) {
        if (this.targetMap.get(char).has(charIndex)) {
          tile.classList.add('fein', 'validatedAnswer', `animation${animationDelay}msDelay`);
          mappedCharButtons.get(char).classList.add("fein");
          if (!feinGuessedSet.has(charIndex)) {
            feinGuessedSet.add(charIndex);
            this.feinGuessed.push(charIndex);
          }
          matches++;
        } else {
          tile.classList.add('meh', 'validatedAnswer', `animation${animationDelay}msDelay`);
          mappedCharButtons.get(char).classList.add("meh");
        }
      } else {
        tile.classList.add('rip', 'validatedAnswer', `animation${animationDelay}msDelay`);
        mappedCharButtons.get(char).classList.add("rip");
      }
      this.previousGuesses.push(char);
    }
    const previousTile = tiles[this.previousGuesses.length - 1];
    previousTile.classList.remove("selected");
    
    // deactivate hard mode toggle
    if (!this.hardModeEnabled && hardModeToggle.ariaDisabled != 'true') {
      hardModeToggle.ariaDisabled = 'true';
    }
    // switch to next guess or end game
    // TODO add animation, alert
    if (matches == 6) {
      // won
      endGame();
    } else if (this.previousGuesses.length != 36) {
      const newTile = tiles[this.previousGuesses.length];
      newTile.classList.add("selected");
      this.currentGuess = [" ", " ", " ", " ", " ", " "];
      this.tileIndex = 0;
    } else {
      // lost
      endGame();
    }
  }

  updateTile(newTileIndex, newChar) {
    if (newChar) {
      this.currentGuess[this.tileIndex] = newChar;
    }
    let index = this.previousGuesses.length + this.tileIndex;
    const tile = tiles[index];
    console.log(tile);
    tile.innerHTML = this.currentGuess[this.tileIndex];
    tile.classList.remove("selected");
    this.tileIndex = newTileIndex
    index = this.previousGuesses.length + this.tileIndex;
    const nextTile = tiles[index];
    nextTile.classList.add("selected");
  }
 
  displayHint() {
    const feinGuessedSet = new Set(this.feinGuessed);
    for (let i = 0; i < 6; i++) {
      if (!feinGuessedSet.has(i)) {
        mappedCharButtons.get(this.target.charAt(i)).classList.add("fein");
        this.feinGuessed.push(i);
        const previousTile = tiles[this.previousGuesses.length + this.tileIndex];
        previousTile.classList.remove('selected');
        const currentTile = tiles[this.previousGuesses.length + i];
        currentTile.innerHTML = this.target.charAt(i);
        currentTile.classList.add('selected');
        // wont ever block hint (first letter always)
        showAlert(`use this ${this.target.charAt(i)} wisely ^_^`);
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

// settings modal elements
const settingsModal = document.getElementById('settingsModal');
const settingsExitButton = document.getElementById('settingsExitButton');
const toggleEvents = ['change', 'click'];
const hardModeToggle = document.getElementById('hardModeToggle');
const darkThemeToggle = document.getElementById('darkThemeToggle');
const highContrastToggle = document.getElementById('highContrastToggle');
const onscreenKeyboardToggle = document.getElementById('onscreenKeyboardToggle');

// big body
const body = document.getElementById("bigBody");

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
const tiles = document.querySelectorAll('[data-tile]'); // holds all game tiles
const game = new Wordbruh("SCARAB", [], false, false, false, []);

function loadGame() {
  // TODO
}

function switchToGameScreen() {
  landingScreen.classList.add('fade');
  setTimeout(() => {
    landingScreen.style.display = "none";
    landingScreen.classList.remove('fade');
    gameScreen.style.display = "block";
    game.running = true;
  }, 150);
}

function showModal(modal) {
  console.log("open sesame");
  modal.showModal();
  modal.classList.add('showModal');
  setTimeout(() => {
    modal.classList.remove('showModal');
    game.running = false;
    game.settingsOpen = true;
  }, 150);
}

function closeModal(modal) {
  console.log("close sesame");
  modal.classList.add('closeModal');
  setTimeout(() => {
    modal.close();
    modal.classList.remove('closeModal');
    game.running = true;
    game.settingsOpen = false;
  }, 150);
}

function clickOffModal(modal, event) {
  const modalDimensions = modal.getBoundingClientRect();
  if (
    event.clientX < modalDimensions.left ||
    event.clientX > modalDimensions.right ||
    event.clientY < modalDimensions.top ||
    event.clientY > modalDimensions.bottom
  ) {
    closeModal(modal);
  }
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
  await new Promise(() => {
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
  charButtons.forEach((button) => {
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

settingsButton.addEventListener('click', () => {
  showModal(settingsModal);
});

settingsExitButton.addEventListener('click', () => {
  closeModal(settingsModal);
});

settingsModal.addEventListener('click', (event) => {
  clickOffModal(settingsModal, event);
});

hardModeToggle.addEventListener('change', () => {
  if (game.previousGuesses.length == 0) {
    game.hardModeEnabled = !game.hardModeEnabled;
  } else if (game.hardModeEnabled) {
    game.hardModeEnabled = false;
    hardModeToggle.ariaDisabled = 'true';
  } else {
    showAlert('Hard mode must be enabled before first guess');
  }
});

darkThemeToggle.addEventListener('change', () => {
  if (darkThemeToggle.checked) {
    body.classList.replace('light', 'dark');
    console.log("welcome to the dark side");
  } else {
    body.classList.replace('dark', 'light');
    console.log("hello light side");
  }
});

highContrastToggle.addEventListener('change', () => {
  console.log("bruh");
  if (highContrastToggle.checked) {
    body.classList.replace('normalContrast', 'highContrast');
    console.log("high contrast activated");
  } else {
    body.classList.replace('highContrast', 'normalContrast');
    console.log("back to the usual");
  }
});

onscreenKeyboardToggle.addEventListener('change', () => {
  game.onscreenKeyboardOnly = !game.onscreenKeyboardOnly;
});

hintButton.addEventListener('click', () => {
  if (game.running && !game.over && !game.hintRevealed) {
    game.displayHint();
  }
}, { once: true });

howToButton.addEventListener('click', () => {
});

accountButton.addEventListener('click', () => {
});

document.body.addEventListener('keydown', (button) => {
  const pressed = button.key.toUpperCase();
  console.log(pressed);
  if (pressed == "ESCAPE") {
    button.preventDefault();
    closeModal(settingsModal);
  } else if (pressed == "TAB" && onscreenKeyboardToggle == document.activeElement) {
    button.preventDefault();
    settingsExitButton.focus();
  } else if (
    game.running && !game.over && !onCooldown.has(pressed) &&
    !game.onscreenKeyboardOnly &&
    (mappedCharButtons.has(pressed) || otherButtons.has(pressed))
    ) { 
    onCooldown.add(pressed);
    switch (pressed) {
      case "ENTER":
        if (body == document.activeElement) {
          game.checkAnswer();
        }
        break;
      case "BACKSPACE":
        game.updateTile(Math.max(game.tileIndex - 1, 0), " ");
        document.activeElement.blur();
        break;
      case "ARROWLEFT":
        game.updateTile(Math.max(game.tileIndex - 1, 0), "");
        document.activeElement.blur();
        break;
      case "ARROWRIGHT":
        game.updateTile(Math.min(game.tileIndex + 1, 5), "");
        document.activeElement.blur();
        break;
      default:
        game.updateTile(Math.min(game.tileIndex + 1, 5), pressed);
        document.activeElement.blur();
    }
  } else if (pressed == 'ENTER') {
    const focusedToggle = document.activeElement;
    switch (focusedToggle) {
      case hardModeToggle:
        hardModeToggle.checked = !hardModeToggle.checked;
        toggle(hardModeToggle);
        break;
      case darkThemeToggle:
        toggle(hardModeToggle);
        break;
      case highContrastToggle:
        toggle(hardModeToggle);
        break;
      case onscreenKeyboardToggle:
        toggle(hardModeToggle);
        break;
    }
  }
});

document.body.addEventListener('keyup', (button) => {
  const pressed = button.key.toUpperCase();
  if (game.running && !game.over && onCooldown.has(pressed)) {
      onCooldown.delete(pressed);
  }
});

charButtons.forEach((button) => {
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


