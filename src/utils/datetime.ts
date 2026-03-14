const pluralize = (count: number, singular: string, plural?: string) => {
  return `${count} ${count === 1 ? singular : plural || singular + 's'} ago`;
};

export const getTimeAgo = (date: Date | string | number) => {
  const now = Date.now();
  const then = new Date(date).getTime();

  const diffInSeconds = Math.floor((now - then) / 1000);
  if (diffInSeconds < 60) return pluralize(diffInSeconds, 'second');

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return pluralize(diffInMinutes, 'minute');

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return pluralize(diffInHours, 'hour');

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return pluralize(diffInDays, 'day');

  const diffInWeeks = Math.floor(diffInDays / 7);
  return pluralize(diffInWeeks, 'week');
};
