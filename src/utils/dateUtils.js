export const formatTimestamp = (timestamp) => {
  if (typeof timestamp === 'number') {
    return new Date(timestamp).toISOString();
  }
  return timestamp;
}; 