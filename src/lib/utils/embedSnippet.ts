
export function buildEmbedSnippet(userId: string): string {
  // Always use the canonical domain without www
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      // Remove www. from the current origin if present
      const origin = window.location.origin;
      return origin.replace('://www.', '://');
    }
    
    // For server-side rendering, always use canonical URL
    return process.env.NEXT_PUBLIC_APP_URL || 'https://trulybot.xyz';
  };

  const baseUrl = getBaseUrl();
    
  return `<script async src="${baseUrl}/widget/loader.js"
  data-chatbot-id="${userId}"
  data-api-url="${baseUrl}">
</script>`;
}
