import { add } from "./lib";

const args = process.argv.slice(2);

const [a, b] = args;

const res = add(1, 2);


console.log(res);