import Player from "./Player";

/* TACTICS: Tactical setup for a Match. */

export type Position = 'goalkeeper' | 'fullback_left' | 'fullback_right' | 'center_back' | 'wingback_left' | 'wingback_right' | 
'midfielder_left' | 'midfielder_right' | 'milfielder_center' | 'forward_center' | 'forward_left' | 'forward_right';

// miten toteutetaan Formation? Määrää kuinka erilaisia Posisitioneja on tarjolla

export type MasterTactic = 'Press_and_possess' | 'Direct' | 'Turtle_and_counter' | 'Balanced';

export default class Tactics {
    public masterTactic: MasterTactic;
    public lineup: Record<Position, Player>;
}