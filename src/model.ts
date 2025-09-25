import { ChatGroq } from "@langchain/groq";
import * as tools from "./tools.ts"

export const receptionistModel = new ChatGroq({
    model: process.env.RECEPTIONIST_MODEL!,
});

export const genMedicineModel = new ChatGroq({
    model: process.env.GENMEDICINE_MODEL!,
}).bindTools([tools.searchTool, tools.retrieveMedicineKnowledge]);

export const genSurgeonModel = new ChatGroq({
    model: process.env.GENSURGEON_MODEL!,
});