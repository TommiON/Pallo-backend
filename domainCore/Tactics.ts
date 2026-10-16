import Player from "./Player";

/* 
TACTICS: a setup for a Match.
- Formation and lineup.
- Master tactic.

This domain object is mainly responsible for managing and constraining how the team is set up. While this will have a great impact on the Match,
Tactics doesn't contain match-resolving logic - that is down to MatchResolver's filters.

*/

export type Position = 'goalkeeper' | 'fullback_left' | 'fullback_right' | 'center_back' | 'wingback_left' | 'wingback_right' | 
'midfielder_left' | 'midfielder_right' | 'midfielder_center' | 'forward_center' | 'forward_left' | 'forward_right';

export type Formation = '4-4-2' | '4-3-3' | '3-5-2' | '5-3-2' | '4-2-3-1' | '3-4-3' | '4-5-1';

export type LineupSlot = {
    position: Position;
    player: Player | null;
};

export type Lineup = ReadonlyArray<LineupSlot>;

const groupings: Record<Formation, Position[]> = {
    '4-4-2': ['goalkeeper', 'fullback_left', 'fullback_right', 'center_back', 'center_back', 'midfielder_left', 'midfielder_right', 'midfielder_center', 'forward_center', 'forward_left', 'forward_right'],
    '4-3-3': ['goalkeeper', 'fullback_left', 'fullback_right', 'center_back', 'center_back', 'midfielder_left', 'midfielder_right', 'midfielder_center', 'forward_center', 'forward_left', 'forward_right'],
    '3-5-2': ['goalkeeper', 'center_back', 'center_back', 'center_back', 'midfielder_left', 'midfielder_right', 'midfielder_center', 'midfielder_center', 'wingback_left', 'wingback_right', 'forward_center'],
    '5-3-2': ['goalkeeper', 'fullback_left', 'fullback_right', 'center_back', 'center_back', 'center_back', 'midfielder_left', 'midfielder_right', 'midfielder_center', 'forward_center', 'forward_center'],
    '4-2-3-1': ['goalkeeper', 'fullback_left', 'fullback_right', 'center_back', 'center_back', 'midfielder_left', 'midfielder_right', 'midfielder_center', 'midfielder_center', 'forward_center', 'forward_center'],
    '3-4-3': ['goalkeeper', 'center_back', 'center_back', 'center_back', 'midfielder_left', 'midfielder_right', 'midfielder_center', 'midfielder_center', 'forward_center', 'forward_left', 'forward_right'],
    '4-5-1': ['goalkeeper', 'fullback_left', 'fullback_right', 'center_back', 'center_back', 'midfielder_left', 'midfielder_right', 'midfielder_center', 'midfielder_center', 'midfielder_center', 'forward_center']
}

export type MasterTactic = 'Press_and_possess' | 'Direct' | 'Turtle_and_counter' | 'Balanced';

const createEmptyLineup = (formation: Formation): LineupSlot[] => {
    return groupings[formation].map((position) => ({
        position,
        player: null,
    }));
};



export default class Tactics {
    public formation: Formation;
    public lineup: LineupSlot[];

    public masterTactic: MasterTactic;

    constructor(formation: Formation = '4-4-2', masterTactic: MasterTactic = 'Balanced') {
        this.formation = formation;
        this.masterTactic = masterTactic;
        this.lineup = createEmptyLineup(formation);
    }

    public setLineup(players: Player[]): void {
        const formationLineup = groupings[this.formation];

        if (players.length !== formationLineup.length) {
            throw new Error(`Expected ${formationLineup.length} players for formation ${this.formation}, got ${players.length}`);
        }

        this.lineup = formationLineup.map((position, index) => ({
            position,
            player: players[index],
        }));
    }

}