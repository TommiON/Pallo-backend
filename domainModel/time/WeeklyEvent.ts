// tämä itse asiassa ei ole domain object (ei persistenssiä), lähtee helvettiin täältä
// vai voiko olla myös konsepteja domain moodelissa? sanoisin että ei, alkaa sotkea

export type WeeklyDeadline = {
    day: number;
    hour: number;
}

export const WeeklyEvent = {}