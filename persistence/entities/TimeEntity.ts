import { EntitySchema } from "typeorm"
import { sharedEntityBaseColumns } from "./sharedEntityBase";

// Pure data structure for persistence - no domain logic
export interface TimeEntityData {
    id: number;
    season: number;
    week: number;
    day: number;
    hour: number;
}

export const TimeEntity = new EntitySchema<TimeEntityData>({
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