import Player from "../Player"
import { PLAYER_MIN_AGE } from "../../../domainProperties/domainProperties";

test('player factory', () => {
    const testPlayer = new Player();

    // should have a name in two parts
    const nameParts = testPlayer.name.split(' ');
    expect(nameParts.length).toEqual(2);
    expect(nameParts[0].length).toBeGreaterThan(1);
    expect(nameParts[1].length).toBeGreaterThan(1);

    // should have age in correct range
    expect(testPlayer.age).toBeGreaterThanOrEqual(PLAYER_MIN_AGE);
    expect(testPlayer.age).toBeLessThanOrEqual(PLAYER_MIN_AGE + 2);
})