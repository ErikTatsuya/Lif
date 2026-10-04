import fs from "node:fs/promises"

let dir = await fs.readdir("./")

for (const foo of dir) {
    if (foo === "die.js") continue;
    await fs.rm(foo, {
        recursive: true,
        force: true
    })
}

console.log(`Antes: ${dir}`)
dir = await fs.readdir("./")
console.log(`Depois: ${dir}`)