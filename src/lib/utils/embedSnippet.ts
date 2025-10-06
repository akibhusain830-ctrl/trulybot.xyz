
export function buildEmbedSnippet(userId: string): string {
  // Get the current domain dynamically
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    
    // For server-side rendering
    return process.env.NEXT_PUBLIC_APP_URL || 'https://trulybot.xyz';
  };

  const baseUrl = getBaseUrl();
    
  return `<script async src="${baseUrl}/widget/loader.js"
  data-chatbot-id="${userId}"
  data-api-url="${baseUrl}">
</script>`;
}
