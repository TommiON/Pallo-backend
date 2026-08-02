export default class MatchBalance {
    startMinute: number;
    endMinute?: number;

    // away shares stored implicitly as 100 - home shares
    homeDefenceLeftWing: number;
    homeDefenceCentre: number;
    homeDefenceRightWing: number;

    homeMidfield: number;

    homeAttackLeftWing: number;
    homeAttackCentre: number;
    homeAttackRightWing: number;
}

// työnjako domainObjectin sisäinen logiikka vs. filtterit?
// keskikentän hallinta 