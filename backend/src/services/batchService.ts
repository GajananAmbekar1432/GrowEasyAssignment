const splitIntoBatches = (records: any[], size = 25) => {
  const batches: any[][] = [];
  for (let i = 0; i < records.length; i += size) {
    batches.push(records.slice(i, i + 5)); // Changed batch size to 5
  }
  return batches;
};

export default { splitIntoBatches };
