export function getOrderedColumns(rows: Array<Record<string, any>>) {
  const keys = new Set<string>();

  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    for (const key of Object.keys(row)) {
      keys.add(key);
    }
  }

  const normalized = (value: string) => value.replace(/[_\s-]+/g, '').toLowerCase();

  const priorityGroups = [
    ['name', 'fullname', 'displayname', 'leadname'],
    ['email', 'emailaddress'],
    ['phone', 'phonenumber', 'mobile', 'mobilephone', 'contactnumber'],
    ['company', 'companyname', 'organization', 'organisation'],
    ['source', 'leadsource', 'importsource'],
    ['status', 'leadstatus', 'stage'],
  ];

  const createdAtGroup = ['createdat', 'createdon', 'createddate', 'timestamp', 'addedon'];

  const rank = (key: string) => {
    const normalizedKey = normalized(key);

    for (let index = 0; index < priorityGroups.length; index += 1) {
      if (priorityGroups[index].includes(normalizedKey)) return index;
    }

    if (createdAtGroup.includes(normalizedKey)) return 100;
    return 50;
  };

  return Array.from(keys).sort((left, right) => {
    const leftRank = rank(left);
    const rightRank = rank(right);

    if (leftRank !== rightRank) return leftRank - rightRank;

    const leftIsCreatedAt = leftRank === 100;
    const rightIsCreatedAt = rightRank === 100;
    if (leftIsCreatedAt && !rightIsCreatedAt) return 1;
    if (!leftIsCreatedAt && rightIsCreatedAt) return -1;

    return left.localeCompare(right);
  });
}