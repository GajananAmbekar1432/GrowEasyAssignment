const splitIntoBatches = (records: any[], size = 25) => {
  const batches: any[][] = [];
  for (let i = 0; i < records.length; i += size) {
    batches.push(records.slice(i, i + size));
  }
  return batches;
};

export default { splitIntoBatches };
