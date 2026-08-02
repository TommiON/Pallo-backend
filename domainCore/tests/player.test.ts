import Player from "../Player"
import { PLAYER_MIN_AGE, PLAYER_STRONG_SKILL_STARTING_RANGE, PLAYER_WEAK_SKILL_STARTING_RANGE } from "../domainProperties";

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

    // should have footedness
    expect(testPlayer.footedness).toBeDefined();

    // should have skills in correct range
    expect(testPlayer.stamina).toBeGreaterThanOrEqual(PLAYER_WEAK_SKILL_STARTING_RANGE[0]);
    expect(testPlayer.stamina).toBeLessThanOrEqual(PLAYER_STRONG_SKILL_STARTING_RANGE[1]);

    expect(testPlayer.pace).toBeGreaterThanOrEqual(PLAYER_WEAK_SKILL_STARTING_RANGE[0]);
    expect(testPlayer.pace).toBeLessThanOrEqual(PLAYER_STRONG_SKILL_STARTING_RANGE[1]);

    expect(testPlayer.strength).toBeGreaterThanOrEqual(PLAYER_WEAK_SKILL_STARTING_RANGE[0]);
    expect(testPlayer.strength).toBeLessThanOrEqual(PLAYER_STRONG_SKILL_STARTING_RANGE[1]);

    expect(testPlayer.height).toBeGreaterThanOrEqual(160);
    expect(testPlayer.height).toBeLessThanOrEqual(200);

    expect(testPlayer.positioning).toBeGreaterThanOrEqual(PLAYER_WEAK_SKILL_STARTING_RANGE[0]);
    expect(testPlayer.positioning).toBeLessThanOrEqual(PLAYER_STRONG_SKILL_STARTING_RANGE[1]);

    expect(testPlayer.vision).toBeGreaterThanOrEqual(PLAYER_WEAK_SKILL_STARTING_RANGE[0]);
    expect(testPlayer.vision).toBeLessThanOrEqual(PLAYER_STRONG_SKILL_STARTING_RANGE[1]);

    expect(testPlayer.shooting).toBeGreaterThanOrEqual(PLAYER_WEAK_SKILL_STARTING_RANGE[0]);
    expect(testPlayer.shooting).toBeLessThanOrEqual(PLAYER_STRONG_SKILL_STARTING_RANGE[1]);

    expect(testPlayer.heading).toBeGreaterThanOrEqual(PLAYER_WEAK_SKILL_STARTING_RANGE[0]);
    expect(testPlayer.heading).toBeLessThanOrEqual(PLAYER_STRONG_SKILL_STARTING_RANGE[1]);

    expect(testPlayer.passing).toBeGreaterThanOrEqual(PLAYER_WEAK_SKILL_STARTING_RANGE[0]);
    expect(testPlayer.passing).toBeLessThanOrEqual(PLAYER_STRONG_SKILL_STARTING_RANGE[1]);

    expect(testPlayer.tackling).toBeGreaterThanOrEqual(PLAYER_WEAK_SKILL_STARTING_RANGE[0]);
    expect(testPlayer.tackling).toBeLessThanOrEqual(PLAYER_STRONG_SKILL_STARTING_RANGE[1]);

    expect(testPlayer.ballControl).toBeGreaterThanOrEqual(PLAYER_WEAK_SKILL_STARTING_RANGE[0]);
    expect(testPlayer.ballControl).toBeLessThanOrEqual(PLAYER_STRONG_SKILL_STARTING_RANGE[1]);

    expect(testPlayer.dribbling).toBeGreaterThanOrEqual(PLAYER_WEAK_SKILL_STARTING_RANGE[0]);
    expect(testPlayer.dribbling).toBeLessThanOrEqual(PLAYER_STRONG_SKILL_STARTING_RANGE[1]);

    expect(testPlayer.shotStopping).toBeGreaterThanOrEqual(PLAYER_WEAK_SKILL_STARTING_RANGE[0]);
    expect(testPlayer.shotStopping).toBeLessThanOrEqual(PLAYER_STRONG_SKILL_STARTING_RANGE[1]);

})