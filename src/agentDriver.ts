import * as readline from 'node:readline/promises';
import { agent } from "./graph.ts";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const main = async () => {
    while (true) {
        const userPrompt = await rl.question('Your Query: ');
        if (userPrompt === '/bye') {
            break;
        }

        const threadConfig = { configurable: { thread_id: "1" } };
        const stream = await agent.stream({ messages: [{ role: "user", content: userPrompt }] }, threadConfig);

        for await (const value of stream){
            console.log("---STEP---");
            console.log(value);
            console.log("---STEP---");
        }
    }
}

await main()
    .finally(() => {
        console.warn(`\nBye!\n`);
        rl.close()
    });