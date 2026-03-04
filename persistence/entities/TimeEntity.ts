import { EntitySchema } from "typeorm"
import Time from "../../domainModel/time/Time";
import { sharedEntityBaseColumns } from "./sharedEntityBase";

export const TimeEntity = new EntitySchema<Time>({
    name: "time",
    columns: {
        ...sharedEntityBaseColumns,
        season: { 
            type: "int" 
        },
        week: { 
            type: "int" 
        },
        day: {
            type: "int"
        },
        hour: {
            type: "int"
        }
    }
})