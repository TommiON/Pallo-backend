import Time from "../../domainModel/time/Time";

// pitää miettiä init/run, ja suhde weekRunneriin

export const seasonRunner = (time: Time) => {
    if (time.week === 1 && time.day === 1 && time.hour === 0) {
        console.log(`Season ${time.season} has started!`);
    } else {
        console.log(`It's season ${time.season}, week ${time.week}, day ${time.day}, hour ${time.hour}.`);
    }
}