
export function buildEmbedSnippet(userId: string): string {
<<<<<<< HEAD
  // Get the current domain dynamically
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    
    // For server-side rendering
=======
  // Always use the canonical domain without www
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      // Remove www. from the current origin if present
      const origin = window.location.origin;
      return origin.replace('://www.', '://');
    }
    
    // For server-side rendering, always use canonical URL
>>>>>>> afe65066d37e0367748c163325382d953fb420b4
    return process.env.NEXT_PUBLIC_APP_URL || 'https://trulybot.xyz';
  };

  const baseUrl = getBaseUrl();
    
  return `<script async src="${baseUrl}/widget/loader.js"
  data-chatbot-id="${userId}"
  data-api-url="${baseUrl}">
</script>`;
}
