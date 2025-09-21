import { ChatGroq } from "@langchain/groq";

export const receptionistModel = new ChatGroq({
    model: process.env.RECEPTIONIST_MODEL!,
});

export const genMedicineModel = new ChatGroq({
    model: process.env.GENMEDICINE_MODEL!,
});

export const genSurgeonModel = new ChatGroq({
    model: process.env.GENSURGEON_MODEL!,
});