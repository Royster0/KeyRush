"use strict";

function countCorrectWordChars(typed, text) {
  let correctWordChars = 0;
  let correctSpaces = 0;
  let index = 0;

  while (index < text.length) {
    const nextSpace = text.indexOf(" ", index);
    const wordEnd = nextSpace === -1 ? text.length : nextSpace;

    if (typed.length < wordEnd) {
      break;
    }

    const expectedWord = text.slice(index, wordEnd);
    const typedWord = typed.slice(index, wordEnd);
    const wordCorrect = typedWord === expectedWord;

    if (nextSpace === -1) {
      if (wordCorrect) {
        correctWordChars += wordEnd - index;
      }
      break;
    }

    const hasTypedSpace = typed.length > wordEnd;
    const spaceCorrect = hasTypedSpace && typed[wordEnd] === " ";

    if (wordCorrect && spaceCorrect) {
      correctWordChars += wordEnd - index;
      correctSpaces += 1;
    }

    if (!hasTypedSpace) {
      break;
    }

    index = wordEnd + 1;
  }

  return { correctWordChars, correctSpaces };
}

module.exports = { countCorrectWordChars };
