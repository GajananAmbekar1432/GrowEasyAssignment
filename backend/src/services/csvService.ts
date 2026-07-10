import Papa from 'papaparse';

const parseCsv = async (text: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results: Papa.ParseResult<any>) => {
        resolve(results.data as any[]);
      },
      error: (err: any) => reject(err),
    });
  });
};

export default { parseCsv };
