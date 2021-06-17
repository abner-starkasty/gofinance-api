/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
import csvParse from 'csv-parse';
import fs from 'fs';

async function loadCSV(filePath: string) {
  const readCSVStream = fs.createReadStream(filePath);

  const parseStream = csvParse({
    // from_line: 2,
    ltrim: true,
    rtrim: true,
  });

  const parseCSV = readCSVStream.pipe(parseStream);

  const lines: any[] | PromiseLike<any[]> = [];

  parseCSV.on('data', line => {
    lines.push(line);
  });

  await new Promise(resolve => {
    parseCSV.on('end', resolve);
  });

  const titleKeys: string[] = lines[0];

  const linesFormatted: any[] = [];

  lines.forEach((line, index) => {
    if (index === 0) return;

    const item: any = {};

    titleKeys.forEach((key, indexKey) => {
      item[key] = line[indexKey];
    });

    return linesFormatted.push(item);
  });

  return linesFormatted;
}

export default loadCSV;
