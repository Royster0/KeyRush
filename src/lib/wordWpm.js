"use strict";

function countCorrectWordChars(typed, text, testEnded = false) {
  let correctWordChars = 0;
  let correctSpaces = 0;
  let index = 0;

  while (index < text.length) {
    const nextSpace = text.indexOf(" ", index);
    const wordEnd = nextSpace === -1 ? text.length : nextSpace;

    if (typed.length < wordEnd) {
      // User hasn't finished typing this word
      if (testEnded && typed.length > index) {
        // Test ended mid-word: count partial chars if they're all correct
        const partialTyped = typed.slice(index);
        const expectedPartial = text.slice(index, index + partialTyped.length);
        if (partialTyped === expectedPartial) {
          correctWordChars += partialTyped.length;
        }
      }
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
