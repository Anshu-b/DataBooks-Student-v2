// Session-level grouping key, not an event timestamp.

export function createBatchTimestamp(): string {
    const now = new Date();
  
    return now
      .toISOString()
      .replace(/:/g, "_")
      .replace(".", "_");
  }
  