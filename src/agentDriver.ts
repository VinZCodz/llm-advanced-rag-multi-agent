import * as readline from 'node:readline/promises';
import { agent } from "./graph.ts";
import { Command } from '@langchain/langgraph';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const main = async () => {
    let interrupted = false;
    while (true) {
        const userPrompt = await rl.question('You:\n');
        if (userPrompt === '/bye') {
            break;
        }
        const threadConfig = { configurable: { thread_id: "1" } };
        const response = await agent.invoke(interrupted ? new Command({ resume: userPrompt }) : { messages: [{ role: "user", content: userPrompt }] }, threadConfig);

        interrupted = false;

        const state = await agent.getState(threadConfig);
        const interrupts = state.tasks[state.tasks.length - 1]?.interrupts;
        if (interrupts) {
            interrupted = true;
            console.log(`Doctor: ${interrupts[interrupts.length - 1]?.value.doctor}`);
        }
        else {
            console.log(`Assistant: ${JSON.parse(response.messages[response.messages.length - 1]?.text!).message}`);
        }
    }
}

await main()
    .finally(() => {
        console.warn(`\nBye!\n`);
        rl.close()
    });