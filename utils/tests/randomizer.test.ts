import { shuffleCollectionRandomly, getRandomNumberInRange, getRandomElement, getRandomElementFromSet } from "../randomizer";

const testArray = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];

test('randomizer / shuffle collection randomly', () => {
    for (let i = 0; i < 5; i++) {
        const result = shuffleCollectionRandomly(testArray);
        expect(result.length).toEqual(testArray.length);
        expect(result.filter(r => r == 'A').length).toEqual(1);
        expect(result.filter(r => r == 'K').length).toEqual(1);
    }
})

// jos aikaa, testeistä voisi tehdä paremmat jonkinlaisella montecarlolla?

test('randomizer / get random number in range', () => {
    for (let i = 0; i < 100; i++) {
        const result = getRandomNumberInRange(0,10);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThan(10);
    }
})

test('randomizer / get random element', () => {
    for (let i = 0; i < 50; i++) {
        const flatResult = getRandomElement(testArray);
        expect(testArray.includes(flatResult)).toBeTruthy;

        const weightedResult = getRandomElement(testArray, [10,10,10]);
        expect(testArray.includes(weightedResult)).toBeTruthy;
    }

    const singletonArray = ['1'];
    for (let i = 0; i < 10; i++) {
        const result = getRandomElement(singletonArray);
        expect(result).toStrictEqual('1');
    }

    const emptyArray: any[] = [];
    const result = getRandomElement(emptyArray);
    expect(result).toBeUndefined;
})