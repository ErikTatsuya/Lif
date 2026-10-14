
import { readFile, writeFile } from "node:fs/promises";

const input = process.argv[2] ?? "src/scripts/eventos-antigo.json";
const output = process.argv[3] ?? "src/scripts/eventos.json";

const eventos = JSON.parse(await readFile(input, "utf8"));

function corrigir(evento, alteracoes) {
    Object.assign(evento, alteracoes);
}

const buscar = (data, ano) =>
    eventos.find(evento => evento.data === data && evento.ano === ano);

// 1. Pioneer 10: cruzar a órbita de Netuno não significa
// ter saído da heliosfera ou entrado no espaço interestelar.
const pioneer = buscar("06-13", 1983);

if (pioneer) {
    corrigir(pioneer, {
        title: "Pioneer 10 cruza a órbita de Netuno",
        descricao:
            "A sonda Pioneer 10 cruza a órbita de Netuno, tornando-se o primeiro objeto feito pelo ser humano a ultrapassar a órbita desse planeta."
    });
}

// 2. Marie e Pierre Curie: distinguir o composto de rádio
// do elemento metálico isolado posteriormente.
const curie = buscar("04-20", 1902);

if (curie) {
    corrigir(curie, {
        title: "Marie Curie obtém rádio purificado",
        descricao:
            "Marie Curie obtém rádio na forma de cloreto de rádio purificado. O rádio metálico seria isolado em 1910 por Marie Curie e André-Louis Debierne."
    });
}

// 3. Hubble: corrigir a data histórica para 1º de janeiro de 1925.
// Isso pode criar duas entradas com data 01-01, então avisamos abaixo.
const hubble = buscar("12-30", 1924);

if (hubble) {
    corrigir(hubble, {
        data: "01-01",
        ano: 1925,
        title: "Hubble apresenta evidências de outras galáxias",
        descricao:
            "Em 1º de janeiro de 1925, Edwin Hubble apresenta à Sociedade Astronômica Americana evidências de que Andrômeda está fora da Via Láctea, ampliando a compreensão da escala do universo."
    });
}

// 4. A mariposa do Harvard Mark II: não afirmar que foi
// o primeiro uso da palavra bug para falhas técnicas.
const bug = buscar("09-09", 1947);

if (bug) {
    corrigir(bug, {
        title: "A famosa mariposa do Harvard Mark II",
        descricao:
            "Operadores do computador Harvard Mark II encontram uma mariposa presa em um relé e registram o inseto no diário de operação. O episódio ficou famoso na história da computação, mas a palavra bug já era usada para descrever falhas técnicas."
    });
}

// 5. Shakespeare e Cervantes: as datas não correspondem
// ao mesmo dia no calendário gregoriano.
const escritores = buscar("04-23", 1616);

if (escritores) {
    corrigir(escritores, {
        title: "As mortes de Shakespeare e Cervantes",
        descricao:
            "Miguel de Cervantes morreu em 22 de abril de 1616 pelo calendário gregoriano. William Shakespeare morreu em 23 de abril de 1616 pelo calendário juliano, equivalente a 3 de maio no gregoriano. As datas frequentemente aparecem associadas ao mesmo dia por causa da diferença entre os calendários."
    });
}

// Verificar se a correção do evento de Hubble criou datas repetidas.
const datas = new Map();

for (const evento of eventos) {
    datas.set(evento.data, (datas.get(evento.data) ?? 0) + 1);
}

const duplicadas = [...datas.entries()]
    .filter(([, quantidade]) => quantidade > 1);

await writeFile(output, JSON.stringify(eventos, null, 2) + "\n", "utf8");

console.log(`Arquivo corrigido salvo em: ${output}`);
console.log(`Total de eventos: ${eventos.length}`);

if (duplicadas.length > 0) {
    console.warn("\nDatas repetidas encontradas:");

    for (const [data, quantidade] of duplicadas) {
        console.warn(`${data}: ${quantidade} eventos`);
    }

    console.warn(
        "\nA data 01-01 pode conter dois eventos após a correção de Hubble. " +
        "Revise isso se seu sistema exigir exatamente um evento por dia."
    );
}
