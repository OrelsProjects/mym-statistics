export function formatNumber(num: number): string {
    if (num >= 1000) {
      const suffixes = ['k', 'M', 'B', 'T']; // Thousand, Million, Billion, Trillion
      let suffixIndex = Math.floor(Math.log10(num) / 3); // Determine the suffix index
      let shortNumber = (num / Math.pow(1000, suffixIndex)).toFixed(1); // Scale down the number
      // Remove the `.0` if not needed
      if (shortNumber.endsWith('.0')) {
        shortNumber = shortNumber.slice(0, -2);
      }
      return shortNumber + suffixes[suffixIndex - 1];
    }
    return num.toString(); // Return the original number if less than 1000
  }